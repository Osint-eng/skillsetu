import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Upload,
  BookOpen,
  FileText,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { DocumentRecord } from '../../server/types.ts';
import { getDocuments, uploadDocument } from '../api/client.ts';
import { ResourceChatbot } from '../components/ResourceChatbot.tsx';

interface DoubtsChatPageProps {
  userId: string;
  onNavigateToPractice?: () => void;
}

export const DoubtsChatPage: React.FC<DoubtsChatPageProps> = ({
  userId,
  onNavigateToPractice,
}) => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('sample-data-analyst-guide');
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const res = await getDocuments();
      setDocuments(res.documents);
      if (res.documents.length > 0 && !selectedDocId) {
        setSelectedDocId(res.documents[0].id);
      }
    } catch (err) {
      console.error('Failed to load documents', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setUploadMessage(null);

    try {
      const res = await uploadDocument(file, userId);
      setUploadMessage(`Successfully parsed "${res.document.filename}" (${res.chunkCount} indexed excerpts). Ready to ask doubts!`);
      await loadDocuments();
      setSelectedDocId(res.document.id);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to parse PDF document.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleLoadSample = async () => {
    setUploading(true);
    setUploadError(null);
    try {
      const res = await uploadDocument(null, userId, true);
      await loadDocuments();
      setSelectedDocId(res.document.id);
      setUploadMessage('Loaded pre-verified Junior Data Analyst curriculum guide.');
    } catch (err: any) {
      setUploadError(err.message || 'Failed to load sample guide.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Source-Grounded AI Doubt Clearing
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Interactive Resource Doubt Tutor
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl">
              Ask any questions or doubts about your uploaded study PDFs. Every explanation is
              retrieved and grounded directly in document passages with page citations.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onNavigateToPractice && (
              <button
                onClick={onNavigateToPractice}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Take Practice Quiz</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Upload Notifications */}
        {uploadMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadMessage}</span>
          </div>
        )}

        {uploadError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar: Document Management */}
        <div className="space-y-4">
          {/* Quick Upload Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Upload New PDF</span>
              </h3>
              <span className="text-[11px] text-slate-400">PDF • Max 10MB</span>
            </div>

            <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 flex flex-col items-center justify-center text-center relative cursor-pointer transition-all">
              <FileText className="w-7 h-7 text-indigo-500 mb-1" />
              <span className="font-semibold text-xs text-slate-800">
                {uploading ? 'Parsing & Indexing Text...' : 'Click to Upload Study Material'}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                Full text parsed page-by-page
              </span>
              <input
                id="doubt-pdf-file-input"
                type="file"
                accept=".pdf"
                disabled={uploading}
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            <button
              onClick={handleLoadSample}
              disabled={uploading}
              className="w-full py-2 px-3 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Load Verified Analyst Guide</span>
            </button>
          </div>

          {/* Uploaded Documents List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Available Resources ({documents.length})</span>
              </h3>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {documents.map((doc) => {
                const isSelected = selectedDocId === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-semibold text-slate-800 truncate block">
                        {doc.filename}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 font-medium">
                      <span>{doc.pageCount} pages</span>
                      <span>•</span>
                      <span>{Math.round(doc.filesize / 1024)} KB</span>
                    </div>
                  </div>
                );
              })}

              {documents.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400">
                  No documents uploaded yet. Upload a PDF above to begin asking doubts!
                </div>
              )}
            </div>
          </div>

          {/* Grounding & Integrity Card */}
          <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>How SkillSetu Solves Doubts</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              When you submit a question, our Semantic Retriever parses tokenized chunks from your
              PDF and feeds them into Gemini 3.8 Flash to formulate an accurate, pedagogical answer with
              direct quotes and page numbers.
            </p>
          </div>
        </div>

        {/* Right Area: Interactive Chatbot */}
        <div className="lg:col-span-2">
          <ResourceChatbot
            documents={documents}
            selectedDocId={selectedDocId}
            onSelectDocId={(id) => setSelectedDocId(id)}
            userId={userId}
            embedded={false}
          />
        </div>
      </div>
    </div>
  );
};
