import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Download,
  Copy,
  Eye,
  Columns,
  Maximize2,
  RefreshCw,
  X,
  Sliders,
  Check,
  Zap,
  BookOpen,
} from 'lucide-react';
import { ALL_LANGUAGES, getLanguageName } from '../languages';
import { GeminiModelId, TranslationDomain, DocumentItem } from '../types';
import ReactMarkdown from 'react-markdown';
import { getApiKeyHeaders } from '../lib/apiKeyStorage';

interface TranslateDocumentViewProps {
  targetLang: string;
  setTargetLang: (lang: string) => void;
}

export const TranslateDocumentView: React.FC<TranslateDocumentViewProps> = ({
  targetLang,
  setTargetLang,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [sourceLang, setSourceLang] = useState<string>('auto');
  const [selectedModel, setSelectedModel] = useState<GeminiModelId>('gemini-3.6-flash');
  const [selectedDomain, setSelectedDomain] = useState<TranslationDomain>('general');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [showPromptEditor, setShowPromptEditor] = useState<boolean>(false);

  const [processing, setProcessing] = useState<boolean>(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activeDocIndex, setActiveDocIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'side' | 'translated' | 'original'>('side');
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartTranslation = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('sourceLang', sourceLang);
    formData.append('targetLang', targetLang);
    formData.append('model', selectedModel);
    formData.append('domain', selectedDomain);
    if (customPrompt) formData.append('customPrompt', customPrompt);

    try {
      const res = await fetch('/api/translate/document', {
        method: 'POST',
        headers: {
          ...getApiKeyHeaders(),
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Translation failed');
      }

      const data = await res.json();
      if (data.documents && data.documents.length > 0) {
        setDocuments(data.documents);
        setActiveDocIndex(0);
      }
    } catch (err) {
      console.error('Document Translation Error:', err);
      alert('Document translation failed. Please verify API key in Settings.');
    } finally {
      setProcessing(false);
    }
  };

  const activeDoc = documents[activeDocIndex];

  const handleExport = async (format: 'docx' | 'pdf' | 'txt' | 'html' | 'md') => {
    if (!activeDoc) return;
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: activeDoc.translatedContent,
          format,
          title: activeDoc.fileName.replace(/\.[^/.]+$/, '') + `_${activeDoc.targetLang}`,
        }),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeDoc.fileName.replace(/\.[^/.]+$/, '')}_translated.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error('Export download error:', e);
    }
  };

  const handleCopyText = () => {
    if (!activeDoc) return;
    navigator.clipboard.writeText(activeDoc.translatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-600" /> Multi-Format Document Translation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Preserves font styles, headings, tables, code syntax, math formulas, and document layout.
          </p>
        </div>

        {/* Supported Formats Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
          {['DOCX', 'DOC', 'PDF', 'TXT', 'MD', 'HTML', 'PPTX', 'XLSX', 'CSV', 'ODT', 'RTF'].map((fmt) => (
            <span
              key={fmt}
              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {/* Translation Settings & Upload Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dropzone Area */}
        <div className="lg:col-span-2 space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-indigo-500/40 dark:border-indigo-500/30 hover:border-indigo-600 dark:hover:border-indigo-400 rounded-3xl p-8 bg-indigo-50/30 dark:bg-slate-900/40 text-center cursor-pointer transition-all hover:bg-indigo-50/60 dark:hover:bg-slate-900/60 group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
              accept=".docx,.doc,.pdf,.txt,.md,.html,.pptx,.xlsx,.csv,.odt,.rtf"
            />
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-indigo-500/10">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-200">
              Drag & Drop your document files here
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports DOCX, PDF, TXT, Markdown, HTML, Excel, PowerPoint, ODT & RTF (Max 50MB per file)
            </p>
            <button
              type="button"
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
            >
              Select Files
            </button>
          </div>

          {/* Upload Queue list */}
          {files.length > 0 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Selected Queue ({files.length} files)</span>
                <button
                  onClick={() => setFiles([])}
                  className="text-red-500 hover:underline text-[11px]"
                >
                  Clear Queue
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate max-w-md">
                      <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Translation Configuration Sidebar */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-500" /> Translation Parameters
          </h3>

          {/* Languages */}
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Source Language</label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {ALL_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag ? `${l.flag} ` : ''}
                    {l.name} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Target Language</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {ALL_LANGUAGES.filter((l) => l.code !== 'auto').map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag ? `${l.flag} ` : ''}
                    {l.name} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* AI Model Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Gemini AI Model</label>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedModel('gemini-3.6-flash')}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  selectedModel === 'gemini-3.6-flash'
                    ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <p className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> Gemini 3.6 Flash
                  </p>
                  <p className="text-[10px] text-slate-400 font-normal">Fast, high throughput</p>
                </div>
                {selectedModel === 'gemini-3.6-flash' && <Check className="w-4 h-4 text-indigo-600" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  selectedModel === 'gemini-3.1-pro-preview'
                    ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <p className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Gemini 3.1 Pro
                  </p>
                  <p className="text-[10px] text-slate-400 font-normal">Deep reasoning & complex layout</p>
                </div>
                {selectedModel === 'gemini-3.1-pro-preview' && <Check className="w-4 h-4 text-indigo-600" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedModel('gemini-3.6-flash-thinking')}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  selectedModel === 'gemini-3.6-flash-thinking'
                    ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <p className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-violet-500" /> Gemini Thinking High
                  </p>
                  <p className="text-[10px] text-slate-400 font-normal">Max logical rigor for legal/academic</p>
                </div>
                {selectedModel === 'gemini-3.6-flash-thinking' && <Check className="w-4 h-4 text-indigo-600" />}
              </button>
            </div>
          </div>

          {/* Domain Style */}
          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-slate-600 dark:text-slate-400 block">Translation Domain</label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value as TranslationDomain)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="general">General (Standard Tone)</option>
              <option value="academic">Academic / Research Paper</option>
              <option value="education">Educational / Pedagogical</option>
              <option value="business">Business & Executive</option>
              <option value="legal">Legal & Contracts</option>
              <option value="medical">Medical & Clinical</option>
              <option value="technical">Technical & Engineering</option>
              <option value="marketing">Marketing & Creative</option>
              <option value="programming">Software & Code Documentation</option>
            </select>
          </div>

          {/* Custom Prompt Toggle */}
          <div>
            <button
              onClick={() => setShowPromptEditor(!showPromptEditor)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              {showPromptEditor ? 'Hide Custom Prompt' : '+ Add Custom AI Prompt Directives'}
            </button>

            {showPromptEditor && (
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Example: Keep proper nouns untranslated. Do not translate code blocks or URLs. Use formal Vietnamese phrasing."
                className="w-full h-24 mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            )}
          </div>

          {/* Action Trigger Button */}
          <button
            onClick={handleStartTranslation}
            disabled={files.length === 0 || processing}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Processing & Synthesizing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Start AI Translation
              </>
            )}
          </button>
        </div>
      </div>

      {/* Side-by-Side Dual Editor / Document Viewer */}
      {documents.length > 0 && activeDoc && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-4">
          {/* Document Tabs & View Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            {/* File Switcher Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-xl">
              {documents.map((doc, idx) => (
                <button
                  key={doc.id}
                  onClick={() => setActiveDocIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeDocIndex === idx
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {doc.fileName}
                </button>
              ))}
            </div>

            {/* Layout Controls & Export Menu */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setViewMode('side')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                    viewMode === 'side'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" /> Side-by-Side
                </button>
                <button
                  onClick={() => setViewMode('translated')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                    viewMode === 'translated'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Translated Only
                </button>
                <button
                  onClick={() => setViewMode('original')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                    viewMode === 'original'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  <Maximize2 className="w-3.5 h-3.5" /> Original Only
                </button>
              </div>

              <button
                onClick={handleCopyText}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>

              {/* Export Dropdown buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleExport('docx')}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> DOCX
                </button>
                <button
                  onClick={() => handleExport('html')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-100 text-xs font-bold hover:bg-slate-700 transition-colors flex items-center gap-1 shadow-sm"
                >
                  HTML
                </button>
                <button
                  onClick={() => handleExport('txt')}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 transition-colors flex items-center gap-1 shadow-sm"
                >
                  TXT
                </button>
              </div>
            </div>
          </div>

          {/* Dual Panel Reader / Preview Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
            {/* Original Document View */}
            {(viewMode === 'side' || viewMode === 'original') && (
              <div
                className={`p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[650px] ${
                  viewMode === 'original' ? 'lg:col-span-2' : ''
                }`}
              >
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>ORIGINAL DOCUMENT ({getLanguageName(activeDoc.sourceLang)})</span>
                  <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {activeDoc.fileType}
                  </span>
                </div>
                <div className="prose dark:prose-invert prose-slate max-w-none text-xs leading-relaxed">
                  <ReactMarkdown>{activeDoc.originalContent}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Translated Document View */}
            {(viewMode === 'side' || viewMode === 'translated') && (
              <div
                className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-500/30 dark:border-indigo-500/20 shadow-sm overflow-y-auto max-h-[650px] ${
                  viewMode === 'translated' ? 'lg:col-span-2' : ''
                }`}
              >
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> TRANSLATED DOCUMENT ({getLanguageName(activeDoc.targetLang)})
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-semibold border border-indigo-500/20">
                    {activeDoc.modelUsed}
                  </span>
                </div>
                <div className="prose dark:prose-invert prose-slate max-w-none text-xs leading-relaxed selection:bg-indigo-500/20">
                  <ReactMarkdown>{activeDoc.translatedContent}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
