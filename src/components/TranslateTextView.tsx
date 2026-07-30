import React, { useState, useRef } from 'react';
import {
  Languages,
  Sparkles,
  Copy,
  Check,
  Volume2,
  Download,
  RotateCcw,
  Sliders,
  Zap,
  BookOpen,
  ArrowRightLeft,
} from 'lucide-react';
import { ALL_LANGUAGES, getLanguageName } from '../languages';
import { GeminiModelId, TranslationDomain } from '../types';
import { getApiKeyHeaders } from '../lib/apiKeyStorage';

interface TranslateTextViewProps {
  targetLang: string;
  setTargetLang: (lang: string) => void;
}

export const TranslateTextView: React.FC<TranslateTextViewProps> = ({
  targetLang,
  setTargetLang,
}) => {
  const [sourceText, setSourceText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [sourceLang, setSourceLang] = useState<string>('auto');
  const [selectedModel, setSelectedModel] = useState<GeminiModelId>('gemini-3.6-flash');
  const [selectedDomain, setSelectedDomain] = useState<TranslationDomain>('general');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  const [copied, setCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const handleTranslate = async () => {
    if (!sourceText.trim() || isStreaming) return;

    setIsStreaming(true);
    setTranslatedText('');

    try {
      const response = await fetch('/api/translate/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getApiKeyHeaders(),
        },
        body: JSON.stringify({
          text: sourceText,
          sourceLang,
          targetLang,
          model: selectedModel,
          domain: selectedDomain,
          customPrompt,
        }),
      });

      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.chunk) {
                  setTranslatedText((prev) => prev + data.chunk);
                }
              } catch (e) {
                // partial JSON chunk
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Text streaming error:', err);
      // Fallback to normal endpoint if SSE fails
      try {
        const res = await fetch('/api/translate/text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getApiKeyHeaders(),
          },
          body: JSON.stringify({
            text: sourceText,
            sourceLang,
            targetLang,
            model: selectedModel,
            domain: selectedDomain,
            customPrompt,
          }),
        });
        const data = await res.json();
        setTranslatedText(data.translatedText || '');
      } catch (fallbackErr) {
        alert('Translation request failed. Please check API key in Settings or Header.');
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const swapLanguages = () => {
    if (sourceLang === 'auto') return;
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!translatedText || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = targetLang;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Languages className="w-7 h-7 text-indigo-600" /> Dịch Văn Bản AI Trực Tiếp
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dịch luồng trực tiếp tức thì với Gemini 3 Flash & Pro, hỗ trợ tùy chỉnh chuyên ngành.
          </p>
        </div>

        {/* Quick Language Swap Controls */}
        <div className="flex items-center gap-2">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            {ALL_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag ? `${l.flag} ` : ''}
                {l.name}
              </option>
            ))}
          </select>

          <button
            onClick={swapLanguages}
            disabled={sourceLang === 'auto'}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-40"
            title="Đảo ngược ngôn ngữ"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            {ALL_LANGUAGES.filter((l) => l.code !== 'auto').map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag ? `${l.flag} ` : ''}
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Model & Parameter Control Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-indigo-500" /> Mô hình:
          </span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as GeminiModelId)}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="gemini-3.6-flash">Flash 3.6 (Nhanh nhất)</option>
            <option value="gemini-3.1-pro-preview">Pro 3.1 (Lập luận cao)</option>
            <option value="gemini-3.6-flash-thinking">Thinking High (Toán/Pháp lý)</option>
          </select>

          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value as TranslationDomain)}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="general">Lĩnh vực: Chung</option>
            <option value="academic">Lĩnh vực: Học thuật</option>
            <option value="education">Lĩnh vực: Giáo dục</option>
            <option value="business">Lĩnh vực: Kinh doanh</option>
            <option value="legal">Lĩnh vực: Pháp lý</option>
            <option value="medical">Lĩnh vực: Y tế</option>
            <option value="technical">Lĩnh vực: Kỹ thuật</option>
            <option value="marketing">Lĩnh vực: Marketing</option>
            <option value="programming">Lĩnh vực: Lập trình / Mã nguồn</option>
          </select>
        </div>

        <button
          onClick={handleTranslate}
          disabled={!sourceText.trim() || isStreaming}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
        >
          {isStreaming ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" /> Đang dịch...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Dịch Văn Bản
            </>
          )}
        </button>
      </div>

      {/* Dual Text Editor Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Box */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between h-96 shadow-sm">
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Nhập hoặc dán văn bản cần dịch vào đây..."
            className="w-full h-full bg-transparent resize-none text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>
              {sourceText.length} ký tự | {sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0} từ
            </span>
            {sourceText && (
              <button
                onClick={() => setSourceText('')}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                Xóa sạch
              </button>
            )}
          </div>
        </div>

        {/* Translation Output Box */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-indigo-500/30 dark:border-indigo-500/20 flex flex-col justify-between h-96 shadow-sm relative overflow-hidden">
          <div className="w-full h-full overflow-y-auto text-sm text-slate-800 dark:text-slate-100 font-medium whitespace-pre-wrap leading-relaxed select-text">
            {translatedText ? (
              translatedText
            ) : (
              <span className="text-slate-400 italic text-xs">
                {isStreaming ? 'AI đang dịch luồng...' : 'Bản dịch sẽ hiển thị trực tiếp tại đây...'}
              </span>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              {translatedText.length} ký tự |{' '}
              {translatedText.trim() ? translatedText.trim().split(/\s+/).length : 0} từ
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSpeak}
                disabled={!translatedText}
                className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                  isSpeaking ? 'text-indigo-600' : 'text-slate-500'
                }`}
                title="Nghe bản đọc"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleCopy}
                disabled={!translatedText}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Sao chép bản dịch"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
