import React from 'react';
import { Info, Sparkles, CheckCircle2, ShieldCheck, FileText, Cpu, BookOpen, Globe } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Info className="w-7 h-7 text-indigo-600" /> Giới Thiệu AI Document Translator Pro
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Hệ thống dịch thuật tài liệu thông minh kết hợp bảo toàn bố cục nâng cao với Google Gemini 3 AI.
        </p>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 w-fit">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Bảo Toàn Đa Định Dạng</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Giữ nguyên phông chữ, kích thước, tiêu đề, bảng biểu, ô gộp, danh sách, công thức toán LaTeX và cú pháp lập trình.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 w-fit">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Đa Mô Hình Gemini 3</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Chuyển đổi linh hoạt giữa Gemini 3.6 Flash tốc độ cao, Gemini 3.1 Pro cho lập luận sâu và Gemini Thinking High cho tài liệu chuyên sâu.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Bộ Thuật Ngữ & Quy Tắc Tùy Chỉnh</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Áp dụng từ điển thuật ngữ chuyên ngành và bảo vệ tên thương hiệu, email, URL, mã sản phẩm không bị dịch sai.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Hơn 100 Ngôn Ngữ Toàn Cầu</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tự động nhận diện và dịch chính xác giữa hơn 100 ngôn ngữ bao gồm Tiếng Việt, Tiếng Anh, Tiếng Pháp, Đức, Nga, Nhật, Hàn, Trung, Tây Ban Nha...
          </p>
        </div>
      </div>

      {/* Deployment & Tech Stack Section */}
      <div className="p-6 rounded-3xl bg-slate-900 text-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" /> Kiến Trúc Full-Stack
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
            <span><strong>AI SDK:</strong> Official @google/genai TypeScript SDK với bảo mật proxy server-side</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
