import { DocumentRecord, DocumentChunk } from '../types.ts';
import { db } from '../storage/store.ts';
import { PDFParse } from 'pdf-parse';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export class DocumentService {
  async processPdfBuffer(
    userId: string,
    filename: string,
    buffer: Buffer
  ): Promise<{ document: DocumentRecord; chunks: DocumentChunk[] }> {
    // 1. Validation
    if (!filename.toLowerCase().endsWith('.pdf')) {
      throw new Error('Invalid file extension: Only PDF files (.pdf) are permitted.');
    }

    if (buffer.length > 10 * 1024 * 1024) {
      throw new Error('File size exceeds maximum limit of 10 MB.');
    }

    if (buffer.length === 0) {
      throw new Error('The uploaded PDF file is empty (0 bytes).');
    }

    const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const docRecord: DocumentRecord = {
      id: docId,
      userId,
      filename,
      filesize: buffer.length,
      pageCount: 0,
      uploadedAt: new Date().toISOString(),
      status: 'processing',
    };
    db.documents.set(docId, docRecord);

    try {
      // 2. Extract page by page using pdf-parse v2 PDFParse or fallback
      const pagesText: Array<{ pageNumber: number; text: string }> = [];
      let totalPages = 0;
      let rawText = '';
      let parsedSuccessfully = false;

      // Method A: Try PDFParse class (pdf-parse v2 standard)
      try {
        let ParserClass: any = PDFParse;
        if (!ParserClass) {
          const mod = require('pdf-parse');
          ParserClass = mod.PDFParse || mod.default?.PDFParse;
        }

        if (typeof ParserClass === 'function') {
          const parser = new ParserClass({ data: buffer });
          try {
            const result = await parser.getText();
            totalPages = result.total || result.pages?.length || 0;
            rawText = result.text || '';

            if (Array.isArray(result.pages) && result.pages.length > 0) {
              for (const p of result.pages) {
                if (p && p.text && p.text.trim()) {
                  pagesText.push({
                    pageNumber: p.num || pagesText.length + 1,
                    text: p.text.trim(),
                  });
                }
              }
            }
            parsedSuccessfully = true;
          } finally {
            try {
              if (typeof parser.destroy === 'function') {
                await parser.destroy();
              }
            } catch {
              // ignore worker destruction errors
            }
          }
        }
      } catch (classErr: any) {
        console.warn('PDFParse class extraction attempt:', classErr?.message);
      }

      // Method B: Legacy function fallback (pdf-parse v1 compatibility)
      if (!parsedSuccessfully || pagesText.length === 0) {
        try {
          const mod = require('pdf-parse');
          const parseFn = typeof mod === 'function' ? mod : mod.default;
          if (typeof parseFn === 'function') {
            const parsed = await parseFn(buffer);
            totalPages = parsed.numpages || 1;
            rawText = parsed.text || '';
          }
        } catch (fnErr: any) {
          console.warn('Legacy pdfParse function fallback attempt:', fnErr?.message);
        }
      }

      // Method C: If pagesText not populated but rawText was extracted, segment across pages
      if (pagesText.length === 0 && rawText.trim()) {
        const fullText = rawText.trim();
        const pageCountEstimate = Math.max(1, totalPages);
        const paragraphs = fullText.split(/\n\s*\n/).filter((p: string) => p.trim().length > 0);
        const parsPerPage = Math.max(1, Math.ceil(paragraphs.length / pageCountEstimate));

        for (let p = 1; p <= pageCountEstimate; p++) {
          const slice = paragraphs.slice((p - 1) * parsPerPage, p * parsPerPage).join('\n\n');
          if (slice.trim()) {
            pagesText.push({ pageNumber: p, text: slice.trim() });
          }
        }
      }

      // Method D: Raw stream text extraction fallback for clean PDFs where parser worker fails
      if (pagesText.length === 0) {
        const bufferStr = buffer.toString('binary');
        // Extract text tokens from PDF streams
        const textMatches = bufferStr.match(/\(([^\)\r\n]{3,})\)\s*Tj/g);
        if (textMatches && textMatches.length > 0) {
          const extracted = textMatches
            .map(m => m.replace(/[\(\)]/g, '').replace(/Tj$/, '').trim())
            .filter(t => t.length > 2)
            .join(' ');
          if (extracted.trim().length > 20) {
            pagesText.push({ pageNumber: 1, text: extracted.trim() });
            totalPages = 1;
          }
        }
      }

      if (pagesText.length === 0) {
        throw new Error(
          'Unable to extract selectable text from this PDF. Please verify that the PDF contains selectable text (not an image-only scan or encrypted file).'
        );
      }

      docRecord.pageCount = Math.max(totalPages, pagesText.length);

      // 3. Chunking: 500 - 800 words per chunk, 80 - 120 words overlap
      const chunks: DocumentChunk[] = [];
      let chunkCounter = 1;

      for (const page of pagesText) {
        const words = page.text.split(/\s+/).filter(w => w.length > 0);
        const chunkSize = 600; // within 500-800 words
        const overlap = 100;   // within 80-120 words

        if (words.length <= chunkSize) {
          chunks.push({
            id: `${docId}-chunk-${chunkCounter++}`,
            documentId: docId,
            chunkIndex: chunkCounter,
            pageNumber: page.pageNumber,
            content: words.join(' '),
            wordCount: words.length,
          });
        } else {
          let start = 0;
          while (start < words.length) {
            const end = Math.min(start + chunkSize, words.length);
            const chunkWords = words.slice(start, end);
            chunks.push({
              id: `${docId}-chunk-${chunkCounter++}`,
              documentId: docId,
              chunkIndex: chunkCounter,
              pageNumber: page.pageNumber,
              content: chunkWords.join(' '),
              wordCount: chunkWords.length,
            });
            if (end >= words.length) break;
            start += (chunkSize - overlap);
          }
        }
      }

      docRecord.status = 'ready';
      db.documents.set(docId, docRecord);
      db.documentChunks.set(docId, chunks);

      return { document: docRecord, chunks };
    } catch (err: any) {
      docRecord.status = 'failed';
      docRecord.errorMessage = err.message || 'PDF processing failed';
      db.documents.set(docId, docRecord);
      throw err;
    }
  }

  searchSimilarChunks(
    documentId: string,
    query: string,
    topK = 3
  ): Array<{ chunk: DocumentChunk; similarityScore: number }> {
    const chunks = db.documentChunks.get(documentId) || [];
    if (chunks.length === 0) return [];

    const queryTokens = this.tokenize(query);

    const scored = chunks.map(chunk => {
      const chunkTokens = this.tokenize(chunk.content);
      const score = this.calculateCosineSimilarity(queryTokens, chunkTokens);
      return {
        chunk,
        similarityScore: Math.round(score * 100) / 100,
      };
    });

    // Sort descending by similarity
    scored.sort((a, b) => b.similarityScore - a.similarityScore);

    // If similarity scores are 0 (e.g. general query), return the first topK chunks
    return scored.slice(0, topK);
  }

  searchSimilarChunksAcrossDocs(
    documentIds: string[],
    query: string,
    topK = 5
  ): Array<{ chunk: DocumentChunk; similarityScore: number; documentTitle?: string }> {
    const allScored: Array<{ chunk: DocumentChunk; similarityScore: number; documentTitle?: string }> = [];
    const queryTokens = this.tokenize(query);

    for (const docId of documentIds) {
      const doc = db.documents.get(docId);
      const chunks = db.documentChunks.get(docId) || [];
      for (const chunk of chunks) {
        const chunkTokens = this.tokenize(chunk.content);
        const score = this.calculateCosineSimilarity(queryTokens, chunkTokens);
        allScored.push({
          chunk,
          similarityScore: Math.round(score * 100) / 100,
          documentTitle: doc?.filename || 'Document',
        });
      }
    }

    allScored.sort((a, b) => b.similarityScore - a.similarityScore);
    return allScored.slice(0, topK);
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w));
  }

  private calculateCosineSimilarity(tokensA: string[], tokensB: string[]): number {
    if (tokensA.length === 0 || tokensB.length === 0) return 0.1;

    const freqA = new Map<string, number>();
    const freqB = new Map<string, number>();

    tokensA.forEach(t => freqA.set(t, (freqA.get(t) || 0) + 1));
    tokensB.forEach(t => freqB.set(t, (freqB.get(t) || 0) + 1));

    const allKeys = new Set([...freqA.keys(), ...freqB.keys()]);
    let dotProduct = 0;
    let magA = 0;
    let magB = 0;

    for (const key of allKeys) {
      const valA = freqA.get(key) || 0;
      const valB = freqB.get(key) || 0;
      dotProduct += valA * valB;
      magA += valA * valA;
      magB += valB * valB;
    }

    if (magA === 0 || magB === 0) return 0.05;
    return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
  }
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'were', 'which',
  'what', 'then', 'will', 'when', 'more', 'about', 'some', 'than', 'into', 'them',
]);

export const documentService = new DocumentService();
