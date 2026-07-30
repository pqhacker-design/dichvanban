import React, { useState, useEffect } from 'react';
import { Sun, Moon, CheckCircle2, AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';
import { POPULAR_LANGUAGES } from '../languages';
import { ApiKeyModal } from './ApiKeyModal';
import { getStoredApiKey } from '../lib/apiKeyStorage';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  targetLang: string;
  setTargetLang: (lang: string) => void;
  apiKeyConfigured: boolean;
  onApiKeyUpdated: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  targetLang,
  setTargetLang,
  apiKeyConfigured,
  onApiKeyUpdated,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [hasCustomKey, setHasCustomKey] = useState<boolean>(false);

  useEffect(() => {
    setHasCustomKey(Boolean(getStoredApiKey()));
  }, [apiKeyConfigured]);

  const handleKeyModalUpdated = () => {
    setHasCustomKey(Boolean(getStoredApiKey()));
    onApiKeyUpdated();
  };

  return (
    <>
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
        {/* Title & Status */}
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Document Translator Pro
          </h2>

          <button
            onClick={() => setIsModalOpen(true)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all cursor-pointer hover:scale-105 ${
              apiKeyConfigured
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 animate-pulse'
            }`}
            title="Bắt buộc nhập Gemini API Key cá nhân để sử dụng dịch thuật"
          >
            {apiKeyConfigured ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>API Key Cá Nhân</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Chưa Nhập API Key (Bắt buộc)</span>
              </>
            )}
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* API Key Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Nhập API Key</span>
          </button>

          {/* Quick Target Language */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Đích:</span>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {POPULAR_LANGUAGES.filter((l) => l.code !== 'auto').map((lang) => (
                <option key={lang.code} value={lang.code} className="dark:bg-slate-900">
                  {lang.flag ? `${lang.flag} ` : ''}
                  {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={darkMode ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-500/20">
              PRO
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">Thành viên Pro</p>
              <p className="text-[10px] text-slate-400 flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3 text-indigo-400" /> Đã xác thực
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApiKeyUpdated={handleKeyModalUpdated}
      />
    </>
  );
};
