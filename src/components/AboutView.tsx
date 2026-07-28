import React from 'react';
import { Info, Sparkles, CheckCircle2, ShieldCheck, FileText, Cpu, BookOpen, Globe } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Info className="w-7 h-7 text-indigo-600" /> About AI Document Translator Pro
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Next-generation document translation engine combining format layout preservation with Google Gemini 3 AI.
        </p>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 w-fit">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Multi-Format Preservation</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Maintains original typography, font sizes, headings, tables, merged cells, lists, math LaTeX formulas, and programming syntax intact.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 w-fit">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Gemini 3 Multi-Model Engine</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Seamlessly switch between Gemini 3.6 Flash for high-speed translation, Gemini 3.1 Pro for deep reasoning, and Gemini Thinking High for complex legal/math papers.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Custom Glossary & Rules</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enforce domain-specific terminology maps and protect brand names, emails, URLs, product IDs, and LaTeX code from unwanted translation.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">100+ Global Languages</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Supports auto-detection and accurate document translation across major global languages including Vietnamese, English, French, German, Russian, Japanese, Korean, Chinese, and Spanish.
          </p>
        </div>
      </div>

      {/* Deployment & Tech Stack Section */}
      <div className="p-6 rounded-3xl bg-slate-900 text-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" /> Full-Stack Architecture
        </h3>
        <ul className="text-xs space-y-2 text-slate-300">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Frontend:</strong> React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Recharts</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Backend:</strong> Node.js, Express, Multer, Mammoth, Server-Sent Events (SSE)</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>AI SDK:</strong> Official @google/genai TypeScript SDK with server-side proxy security</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
