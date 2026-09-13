import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  BookOpen,
  FileText,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Copy,
  Check,
  Layers,
  AlertCircle
} from 'lucide-react';
import { DocumentRecord, ChatCitation, ChatMessage } from '../../server/types.ts';
import { askDocumentDoubt, askGlobalResourceDoubt } from '../api/client.ts';

interface ResourceChatbotProps {
  documents: DocumentRecord[];
  selectedDocId: string;
  onSelectDocId?: (docId: string) => void;
  userId?: string;
  embedded?: boolean;
}

export const ResourceChatbot: React.FC<ResourceChatbotProps> = ({
  documents,
  selectedDocId,
  onSelectDocId,
  userId = 'alex-demo-user',
  embedded = true,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCitation, setActiveCitation] = useState<ChatCitation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [scopeMode, setScopeMode] = useState<'selected' | 'all'>('selected');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeDoc = documents.find(d => d.id === selectedDocId) || documents[0];

  // Initialize with welcoming system prompt if empty
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-msg',
          role: 'model',
          content: `Hello! I am your **SkillSetu AI Tutor**. You can ask me any doubts regarding **${
            activeDoc?.filename || 'your uploaded study material'
          }**.\n\nEvery answer is strictly grounded in the document passages with exact page-level citations.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedFollowUps: [
            'Summarize the key takeaways from this document',
            'Why is the median preferred over the mean for skewed data?',
            'What graphical integrity rules apply to bar charts?',
            'Explain the data privacy anonymization principles',
          ],
        },
      ]);
    }
  }, [activeDoc?.filename]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const text = (queryText || inputQuery).trim();
    if (!text || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Build brief history
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content,
      }));

      let res;
      if (scopeMode === 'all' || !selectedDocId) {
        res = await askGlobalResourceDoubt(text, userId, historyPayload);
      } else {
        res = await askDocumentDoubt(selectedDocId, text, historyPayload);
      }

      const botMsgId = `bot-${Date.now()}`;
      const botMsg: ChatMessage = {
        id: botMsgId,
        role: 'model',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: res.citations,
        suggestedFollowUps: res.suggestedFollowUps,
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `I encountered an issue answering your doubt: ${
          err.message || 'Please verify that your document is loaded properly and retry.'
        }`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'model',
        content: `Chat session refreshed. What doubt or question can I help you clarify from **${
          activeDoc?.filename || 'your uploaded resource'
        }**?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: [
          'What are the foundational formulas described here?',
          'Summarize chapter 1 in 3 bullet points',
          'What are the common pitfalls mentioned in this guide?',
        ],
      },
    ]);
    setActiveCitation(null);
  };

  // Render markdown-like formatting (bolding, quotes, lists)
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-sm leading-relaxed text-slate-800">
        {lines.map((line, idx) => {
          if (line.startsWith('> ')) {
            return (
              <blockquote
                key={idx}
                className="pl-3 py-1 my-1 border-l-4 border-indigo-500 bg-indigo-50/60 rounded-r text-indigo-950 italic text-xs font-mono"
              >
                {line.substring(2)}
              </blockquote>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            const parsedText = line.substring(2);
            return (
              <li key={idx} className="ml-4 list-disc text-slate-700">
                {parseInlineBold(parsedText)}
              </li>
            );
          }
          if (line.trim() === '') {
            return <div key={idx} className="h-1" />;
          }
          return <p key={idx}>{parseInlineBold(line)}</p>;
        })}
      </div>
    );
  };

  const parseInlineBold = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\[Page\s+\d+\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (/^\[Page\s+\d+\]$/i.test(part)) {
        return (
          <span
            key={i}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200 mx-0.5 align-baseline"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div
      id="resource-chatbot-container"
      className={`flex flex-col bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden ${
        embedded ? 'h-[640px]' : 'h-full max-h-[85vh]'
      }`}
    >
      {/* Header bar */}
      <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-tight text-white">SkillSetu AI Resource Tutor</h3>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Grounded Doubt Solver
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive doubts grounded directly on your uploaded documents
            </p>
          </div>
        </div>

        {/* Document Selector & Controls */}
        <div className="flex items-center gap-2">
          {documents.length > 0 && (
            <div className="relative">
              <select
                id="chatbot-document-selector"
                value={scopeMode === 'all' ? 'all' : selectedDocId}
                onChange={(e) => {
                  if (e.target.value === 'all') {
                    setScopeMode('all');
                  } else {
                    setScopeMode('selected');
                    if (onSelectDocId) {
                      onSelectDocId(e.target.value);
                    }
                  }
                }}
                className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 pr-7 appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-medium max-w-[210px] truncate"
              >
                <option value="all">📚 All Uploaded Documents</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    📄 {d.filename} ({d.pageCount}p)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          )}

          <button
            id="chatbot-reset-btn"
            onClick={handleResetChat}
            title="Reset conversation"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Resource banner */}
      <div className="px-5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2 truncate">
          <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="font-semibold text-slate-700">Active Focus:</span>
          <span className="truncate text-slate-800 font-medium">
            {scopeMode === 'all'
              ? 'Multi-Document Index (All Uploaded Study Materials)'
              : activeDoc
              ? `${activeDoc.filename} (${activeDoc.pageCount} pages)`
              : 'No document selected'}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Page-Grounded Citations</span>
        </div>
      </div>

      {/* Message History List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-indigo-900">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>SkillSetu AI Tutor</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="text-slate-400 hover:text-slate-600 p-0.5 transition-colors"
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {isUser ? (
                  <p className="text-sm font-medium whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  renderFormattedContent(msg.content)
                )}

                {/* Grounded Citations Badges */}
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Verified Source Citations:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((c, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => setActiveCitation(c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 text-slate-700 transition-colors"
                          title="Click to view exact source passage"
                        >
                          <span className="font-bold text-indigo-600">Page {c.pageNumber}</span>
                          <span className="text-slate-400">|</span>
                          <span className="truncate max-w-[150px] text-slate-500">
                            {c.documentTitle || 'Source'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Follow-up Doubt Prompts */}
                {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-indigo-500" />
                      Explore Further / Related Doubts:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedFollowUps.map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleSend(prompt)}
                          disabled={isLoading}
                          className="text-left text-xs bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 border border-indigo-200/80 px-2.5 py-1 rounded-full transition-all flex items-center gap-1 disabled:opacity-50"
                        >
                          <span>{prompt}</span>
                          <ArrowRight className="w-3 h-3 shrink-0 opacity-60" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs max-w-sm">
              <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold">
                <Sparkles className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Consulting uploaded document pages & formulating answer...</span>
              </div>
              <div className="mt-2 flex gap-1">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Citation Modal / Excerpt Drawer */}
      {activeCitation && (
        <div className="p-3 bg-amber-50/90 border-t border-amber-200 flex items-start justify-between gap-3 text-xs text-amber-900">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              <span>Supporting Passage from Page {activeCitation.pageNumber}</span>
              {activeCitation.documentTitle && (
                <span className="font-normal text-amber-800">
                  ({activeCitation.documentTitle})
                </span>
              )}
            </div>
            <p className="italic bg-white/80 p-2 rounded border border-amber-200/70 font-mono text-[11px] leading-relaxed">
              "{activeCitation.snippet}"
            </p>
          </div>
          <button
            onClick={() => setActiveCitation(null)}
            className="text-amber-700 hover:text-amber-950 font-bold p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2"
        >
          <div className="flex-1 relative">
            <textarea
              id="chatbot-doubt-input"
              ref={inputRef}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask any doubt about ${
                scopeMode === 'all'
                  ? 'all uploaded resources'
                  : activeDoc?.filename || 'this resource'
              }... (Enter to send)`}
              rows={2}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all"
            />
          </div>

          <button
            id="chatbot-send-btn"
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="h-[46px] px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-semibold">Ask Doubt</span>
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>Shift+Enter for newline</span>
          <span className="flex items-center gap-1 text-slate-500">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            SkillSetu Source-Grounded RAG
          </span>
        </div>
      </div>
    </div>
  );
};
