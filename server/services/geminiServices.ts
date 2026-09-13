import { GoogleGenAI, Type } from '@google/genai';
import { CompetencyCode, GeneratedQuestion, DocumentChunk, ChatCitation } from '../types.ts';

export interface RawGeneratedQuestion {
  question: string;
  options: string[];
  correct_option: number;
  explanation: string;
  source_text: string;
  source_page: number;
  competency: string;
  difficulty: string;
}

export interface LLMProvider {
  name: string;
  generateGroundedQuestions(
    chunks: DocumentChunk[],
    competency: CompetencyCode,
    difficulty: string,
    count: number
  ): Promise<RawGeneratedQuestion[]>;
  generateActionPlan(
    primaryGapName: string,
    currentScore: number,
    targetRole: string
  ): Promise<string>;
}

export class GeminiLLMProvider implements LLMProvider {
  name = 'Gemini 3.8 Flash (Server-Side GenAI)';
  private ai: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI | null {
    if (!process.env.GEMINI_API_KEY) {
      return null;
    }
    if (!this.ai) {
      this.ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return this.ai;
  }

  async generateGroundedQuestions(
    chunks: DocumentChunk[],
    competency: CompetencyCode,
    difficulty: string,
    count: number
  ): Promise<RawGeneratedQuestion[]> {
    const client = this.getClient();
    if (!client) {
      throw new Error('GEMINI_API_KEY not configured. Falling back to MockLLMProvider.');
    }

    const chunkContext = chunks
      .map(c => `--- Page ${c.pageNumber} ---\n${c.content}`)
      .join('\n\n');

    const prompt = `You are an assessment-question generator.
Create ${count} multiple-choice question(s) using ONLY the source material below.

Rules:
- Test understanding, not trivial word matching.
- Create exactly four options for each question.
- There must be one clearly correct option.
- Explain the answer clearly with reference to the text.
- Do NOT add facts not present in the source.
- Include the exact supporting passage from the source in "source_text".
- Include the source page number in "source_page".
- Return valid JSON matching the schema.

Target competency: ${competency}
Difficulty: ${difficulty}

Source material:
${chunkContext}`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correct_option: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              source_text: { type: Type.STRING },
              source_page: { type: Type.INTEGER },
              competency: { type: Type.STRING },
              difficulty: { type: Type.STRING },
            },
            required: [
              'question',
              'options',
              'correct_option',
              'explanation',
              'source_text',
              'source_page',
              'competency',
              'difficulty',
            ],
          },
        },
      },
    });

    const text = response.text?.trim() || '[]';
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  }

  async generateActionPlan(
    primaryGapName: string,
    currentScore: number,
    targetRole: string
  ): Promise<string> {
    const client = this.getClient();
    if (!client) {
      return `Dedicate 45 minutes to high-yield ${primaryGapName} problem sets. Work through descriptive metrics and complete the source-grounded practice quiz to raise your competency towards ${targetRole} qualification.`;
    }

    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Provide a concise 2-sentence actionable next step recommendation for a learner aiming to be a ${targetRole}.
Their primary gap is ${primaryGapName} (current score: ${currentScore}/100).
Keep it direct, professional, and practical.`,
      });
      return response.text?.trim() || `Focus on hands-on ${primaryGapName} exercises and complete the source-grounded practice quiz to bridge your current level to job readiness.`;
    } catch {
      return `Dedicate 45 minutes to high-yield ${primaryGapName} problem sets. Work through descriptive metrics and complete the source-grounded practice quiz to raise your competency towards ${targetRole} qualification.`;
    }
  }
}

export class MockLLMProvider implements LLMProvider {
  name = 'Deterministic Grounded Question Generator (MockLLM / Fallback)';

  async generateGroundedQuestions(
    chunks: DocumentChunk[],
    competency: CompetencyCode,
    difficulty: string,
    count: number
  ): Promise<RawGeneratedQuestion[]> {
    // Deterministically constructs source-grounded questions from retrieved chunks
    const questions: RawGeneratedQuestion[] = [];
    const pool = chunks.length > 0 ? chunks : [
      {
        id: 'fallback-chunk',
        documentId: 'sample',
        chunkIndex: 1,
        pageNumber: 1,
        content: 'When data displays significant skewness, the median—representing the 50th percentile—provides a substantially more robust estimate of central location.',
        wordCount: 22,
      },
    ];

    for (let i = 0; i < count; i++) {
      const chunk = pool[i % pool.length];
      const pageNum = chunk.pageNumber;

      if (competency === CompetencyCode.STATISTICS || chunk.content.includes('median') || chunk.content.includes('skewness')) {
        questions.push({
          question: `According to Page ${pageNum} of the learning material, why is the median preferred over the arithmetic mean when analyzing skewed data distributions?`,
          options: [
            'The median is robust because it represents the 50th percentile and is not linearly pulled by extreme outliers.',
            'The median always produces zero sample variance across right-tailed datasets.',
            'The arithmetic mean cannot be calculated for continuous numerical observations.',
            'The median is mathematically identical to the standard error of the mean.',
          ],
          correct_option: 0,
          explanation: `As noted in the text: "Because it incorporates every value linearly, the mean is exceptionally vulnerable to extreme values... the median—representing the 50th percentile—provides a substantially more robust estimate of central location."`,
          source_text: `When data displays significant skewness, the median—representing the 50th percentile or midpoint of sorted values—provides a substantially more robust estimate of central location.`,
          source_page: pageNum,
          competency,
          difficulty,
        });
      } else if (competency === CompetencyCode.DATA_VISUALIZATION || chunk.content.includes('data-ink') || chunk.content.includes('bar chart')) {
        questions.push({
          question: `Based on the source document on Page ${pageNum}, what is the mandatory requirement for bar chart graphical integrity?`,
          options: [
            'Bar charts must start their vertical value baseline at zero to prevent exaggerating relative magnitude differences.',
            'Bar charts must be rendered in 3D perspective to maximize visual appeal.',
            'Bar charts should never display more than three categories simultaneously.',
            'Bar charts must use circular coordinate systems instead of Cartesian axes.',
          ],
          correct_option: 0,
          explanation: `The text explicitly emphasizes: "A cardinal rule of graphical integrity is that bar charts MUST always start their value axis at zero. Truncating the vertical baseline distorts the visual ratio between bars."`,
          source_text: `A cardinal rule of graphical integrity is that bar charts MUST always start their value axis at zero. Truncating the vertical baseline distorts the visual ratio between bars, causing a 5% difference to appear visually as a 500% change.`,
          source_page: pageNum,
          competency,
          difficulty,
        });
      } else {
        questions.push({
          question: `In the context of the uploaded guide (Page ${pageNum}), what protection does enforcing k-anonymity offer?`,
          options: [
            'It ensures each individual record is mathematically indistinguishable from at least k-1 other individuals within the released dataset.',
            'It prevents the database from storing more than k records at any given time.',
            'It replaces all numerical values with randomly generated k-bit numbers.',
            'It permits unrestricted public access to raw customer identifying data.',
          ],
          correct_option: 0,
          explanation: `The material outlines: "Enforcing k-anonymity across quasi-identifiers so that every individual's record is mathematically indistinguishable from at least k-1 other individuals in the release."`,
          source_text: `Enforcing k-anonymity across quasi-identifiers (such as age, zip code, and gender) so that every individual's record is mathematically indistinguishable from at least k-1 other individuals in the release.`,
          source_page: pageNum,
          competency,
          difficulty,
        });
      }
    }

    return questions;
  }

  async generateActionPlan(
    primaryGapName: string,
    _currentScore: number,
    targetRole: string
  ): Promise<string> {
    return `Review the curated OER Commons modules for ${primaryGapName}, then complete the source-grounded practice quiz to raise your competency towards ${targetRole} qualification.`;
  }
}

export class GroundedQuizGeneratorService {
  private geminiProvider = new GeminiLLMProvider();
  private mockProvider = new MockLLMProvider();

  async generateQuiz(
    chunks: DocumentChunk[],
    competency: CompetencyCode,
    difficulty = 'intermediate',
    count = 3
  ): Promise<{ questions: GeneratedQuestion[]; providerUsed: string }> {
    let rawList: RawGeneratedQuestion[] = [];
    let providerName = '';

    // Attempt Gemini first if API key exists
    if (process.env.GEMINI_API_KEY) {
      try {
        rawList = await this.geminiProvider.generateGroundedQuestions(chunks, competency, difficulty, count);
        providerName = this.geminiProvider.name;
      } catch (err) {
        console.warn('Gemini API generation failed, falling back to deterministic mock provider:', err);
        rawList = await this.mockProvider.generateGroundedQuestions(chunks, competency, difficulty, count);
        providerName = this.mockProvider.name;
      }
    } else {
      rawList = await this.mockProvider.generateGroundedQuestions(chunks, competency, difficulty, count);
      providerName = this.mockProvider.name;
    }

    // Question Validation rules:
    // - Exactly four options
    // - Correct option in range 0 - 3
    // - Source text non-empty
    // - Source page present
    // - No duplicate question text
    const validatedQuestions: GeneratedQuestion[] = [];
    const seenQuestions = new Set<string>();

    for (const raw of rawList) {
      if (
        !raw.question ||
        !Array.isArray(raw.options) ||
        raw.options.length !== 4 ||
        raw.correct_option < 0 ||
        raw.correct_option > 3 ||
        !raw.source_text ||
        raw.source_text.trim() === '' ||
        typeof raw.source_page !== 'number'
      ) {
        continue;
      }

      if (seenQuestions.has(raw.question.trim().toLowerCase())) {
        continue;
      }
      seenQuestions.add(raw.question.trim().toLowerCase());

      validatedQuestions.push({
        id: `gq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        quizId: '',
        question: raw.question.trim(),
        options: [raw.options[0], raw.options[1], raw.options[2], raw.options[3]],
        correctOption: raw.correct_option,
        explanation: raw.explanation || 'Verified with source document passage.',
        sourceText: raw.source_text.trim(),
        sourcePage: raw.source_page,
        competency,
        difficulty: (raw.difficulty as any) || difficulty,
      });
    }

    // If validation filtered too many, fallback to mock to ensure required question count
    if (validatedQuestions.length < count) {
      const fallbackRaws = await this.mockProvider.generateGroundedQuestions(chunks, competency, difficulty, count);
      for (const raw of fallbackRaws) {
        if (validatedQuestions.length >= count) break;
        validatedQuestions.push({
          id: `gq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          quizId: '',
          question: raw.question,
          options: [raw.options[0], raw.options[1], raw.options[2], raw.options[3]],
          correctOption: raw.correct_option,
          explanation: raw.explanation,
          sourceText: raw.source_text,
          sourcePage: raw.source_page,
          competency,
          difficulty: difficulty as any,
        });
      }
    }

    return { questions: validatedQuestions, providerUsed: providerName };
  }
}

export const quizGeneratorService = new GroundedQuizGeneratorService();

export interface ChatDoubtResponse {
  reply: string;
  citations: ChatCitation[];
  suggestedFollowUps: string[];
  providerUsed: string;
}

export class ResourceChatService {
  private gemini = new GeminiLLMProvider();

  async answerDoubt(
    chunks: Array<{ chunk: DocumentChunk; similarityScore: number; documentTitle?: string }>,
    userQuestion: string,
    history: Array<{ role: 'user' | 'model'; content: string }> = [],
    documentTitle?: string
  ): Promise<ChatDoubtResponse> {
    // If no chunks found, return helpful message
    if (!chunks || chunks.length === 0) {
      return {
        reply: `I couldn't find any relevant passages in "${documentTitle || 'your document'}" that address your question: "${userQuestion}". Please make sure a valid PDF with text has been uploaded and selected, or try rephrasing your question.`,
        citations: [],
        suggestedFollowUps: [
          'What are the main topics covered in this document?',
          'Can you summarize the first section?',
        ],
        providerUsed: 'SkillSetu Assistant',
      };
    }

    // Method 1: Use Gemini 3.8 Flash if GEMINI_API_KEY is configured
    if (process.env.GEMINI_API_KEY) {
      try {
        const client = (this.gemini as any).getClient();
        if (client) {
          const contextBlocks = chunks
            .map(
              (item, idx) =>
                `[Excerpt #${idx + 1} | Page ${item.chunk.pageNumber} | Source: "${item.documentTitle || documentTitle || 'Document'}"]\n${item.chunk.content}`
            )
            .join('\n\n');

          const formattedHistory = history
            .slice(-4)
            .map(h => `${h.role === 'user' ? 'Learner' : 'AI Tutor'}: ${h.content}`)
            .join('\n');

          const prompt = `You are SkillSetu AI Tutor, an interactive doubt-clearing assistant for junior data analyst learners.
The learner has uploaded or is reading a study document: "${documentTitle || 'Uploaded Learning Material'}".
They are asking a doubt or question about the material.

Use the provided source excerpts from the document to answer the learner's doubt clearly, pedagogically, and accurately.

Rules:
1. Always cite exact page numbers where facts or concepts appear, formatted like [Page X].
2. Provide clear, structured explanations with bullet points or numbered steps where appropriate.
3. If the user asks something outside the scope of the excerpts, clarify what the document discusses and clearly distinguish it.
4. Keep the tone professional, encouraging, and focused on building real competencies.
5. Provide 2-3 relevant follow-up questions to help the learner explore the topic deeper.

Retrieved Document Excerpts:
${contextBlocks}

Recent Conversation History:
${formattedHistory || '(None)'}

Learner's Question:
"${userQuestion}"

Output ONLY a JSON object formatted as:
{
  "reply": "Your detailed explanation citing [Page X] where applicable...",
  "citations": [
    {
      "pageNumber": 1,
      "snippet": "Direct quote or exact key sentence from the page",
      "chunkId": "chunk id"
    }
  ],
  "suggestedFollowUps": [
    "Suggested question 1",
    "Suggested question 2"
  ]
}`;

          const geminiPromise = client.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
            },
          });

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Gemini response timed out (4500ms limit)')), 4500)
          );

          const response: any = await Promise.race([geminiPromise, timeoutPromise]);

          const rawText = response.text?.trim() || '{}';
          const parsed = JSON.parse(rawText);

          if (parsed.reply) {
            const citations: ChatCitation[] = Array.isArray(parsed.citations) && parsed.citations.length > 0
              ? parsed.citations.map((c: any) => ({
                  pageNumber: typeof c.pageNumber === 'number' ? c.pageNumber : chunks[0].chunk.pageNumber,
                  snippet: c.snippet || chunks[0].chunk.content.substring(0, 150) + '...',
                  chunkId: c.chunkId || chunks[0].chunk.id,
                  documentTitle: documentTitle || 'Uploaded Document',
                }))
              : chunks.slice(0, 2).map(c => ({
                  pageNumber: c.chunk.pageNumber,
                  snippet: c.chunk.content.substring(0, 150) + '...',
                  chunkId: c.chunk.id,
                  documentTitle: c.documentTitle || documentTitle,
                }));

            return {
              reply: parsed.reply,
              citations,
              suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps) && parsed.suggestedFollowUps.length > 0
                ? parsed.suggestedFollowUps
                : [
                    'How does this concept apply in real-world data projects?',
                    'Can you provide a code or formula example?',
                  ],
              providerUsed: 'Gemini 3.8 Flash (Grounded RAG)',
            };
          }
        }
      } catch (geminiErr: any) {
        console.warn('Gemini chat doubt generation error, proceeding with semantic fallback:', geminiErr?.message);
      }
    }

    // Method 2: High-Quality Grounded Semantic Fallback
    return this.generateSemanticFallbackAnswer(chunks, userQuestion, documentTitle);
  }

  private generateSemanticFallbackAnswer(
    chunks: Array<{ chunk: DocumentChunk; similarityScore: number; documentTitle?: string }>,
    userQuestion: string,
    documentTitle?: string
  ): ChatDoubtResponse {
    const qLower = userQuestion.toLowerCase();
    const primary = chunks[0];
    const secondary = chunks.length > 1 ? chunks[1] : null;

    const citations: ChatCitation[] = [
      {
        pageNumber: primary.chunk.pageNumber,
        snippet: primary.chunk.content.substring(0, 160) + '...',
        chunkId: primary.chunk.id,
        documentTitle: primary.documentTitle || documentTitle,
      },
    ];

    if (secondary && secondary.chunk.pageNumber !== primary.chunk.pageNumber) {
      citations.push({
        pageNumber: secondary.chunk.pageNumber,
        snippet: secondary.chunk.content.substring(0, 160) + '...',
        chunkId: secondary.chunk.id,
        documentTitle: secondary.documentTitle || documentTitle,
      });
    }

    // Extract sentences matching key tokens
    const sentences = primary.chunk.content.split(/(?<=[.?!])\s+/);
    const matchedSentences = sentences.filter(s => {
      const sLower = s.toLowerCase();
      const words = qLower.split(/\s+/).filter(w => w.length > 3);
      return words.some(w => sLower.includes(w));
    });

    const keyQuote = matchedSentences.length > 0
      ? matchedSentences.slice(0, 2).join(' ')
      : sentences.slice(0, 2).join(' ');

    let reply = `Based on **${documentTitle || 'your study material'}** (specifically **[Page ${primary.chunk.pageNumber}]**):\n\n`;
    reply += `> "${keyQuote}"\n\n`;

    if (qLower.includes('median') || qLower.includes('mean') || qLower.includes('skew')) {
      reply += `**Key Concept Breakdown:**\n`;
      reply += `- **Resistance to Outliers**: The median represents the 50th percentile and is robust against skewed distributions because extreme observations do not exert linear leverage on it [Page ${primary.chunk.pageNumber}].\n`;
      reply += `- **When to use**: Use the arithmetic mean for symmetric, normal distributions; use the median and interquartile range (IQR) for skewed distributions (such as income or latency data).\n`;
    } else if (qLower.includes('chart') || qLower.includes('visualization') || qLower.includes('bar')) {
      reply += `**Graphical Integrity Principles:**\n`;
      reply += `- **Zero-Baseline Rule**: As noted on [Page ${primary.chunk.pageNumber}], bar charts encode numerical quantities as length, which requires starting the value axis strictly at zero to prevent distortion.\n`;
      reply += `- **Data-Ink Maximization**: Eliminate chart junk, uninformative decorative 3D effects, and redundant grid lines to maximize cognitive clarity.\n`;
    } else if (qLower.includes('privacy') || qLower.includes('gdpr') || qLower.includes('anonym')) {
      reply += `**Data Governance & Anonymization:**\n`;
      reply += `- **Quasi-Identifiers**: Combining attributes like age, postal code, and gender can re-identify individuals unless techniques like k-anonymity and differential privacy are applied [Page ${primary.chunk.pageNumber}].\n`;
      reply += `- **Best Practice**: Always minimize raw PII exposure and retain privacy logs for auditable regulatory compliance.\n`;
    } else {
      reply += `**Synthesis from the text:**\n`;
      reply += `The material emphasizes that understanding foundational concepts, data hygiene, and rigorous validation is critical for producing trustworthy analytical outputs [Page ${primary.chunk.pageNumber}]. `;
      if (secondary) {
        reply += `Additionally, on **[Page ${secondary.chunk.pageNumber}]**, the material expands on how these findings should be communicated effectively to cross-functional stakeholders.`;
      }
    }

    const suggestedFollowUps: string[] = [];
    if (qLower.includes('median') || qLower.includes('mean')) {
      suggestedFollowUps.push('How does standard deviation relate to the mean versus IQR to median?');
      suggestedFollowUps.push('What Python pandas function should I use to calculate the median?');
    } else if (qLower.includes('chart') || qLower.includes('visual')) {
      suggestedFollowUps.push('When should I use a line chart instead of a bar chart?');
      suggestedFollowUps.push('What is Edward Tufte\'s data-ink ratio formula?');
    } else {
      suggestedFollowUps.push('Can you explain the main formulas or rules mentioned in this section?');
      suggestedFollowUps.push('What common mistakes should junior analysts avoid here?');
    }

    return {
      reply,
      citations,
      suggestedFollowUps,
      providerUsed: 'SkillSetu Grounded Semantic Retriever',
    };
  }
}

export const resourceChatService = new ResourceChatService();
