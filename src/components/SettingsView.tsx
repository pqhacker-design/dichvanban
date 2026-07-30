import React, { useState, useEffect } from 'react';
import { Settings, Sparkles, CheckCircle2, Sliders, ShieldCheck, RefreshCw, KeyRound, Eye, EyeOff, Trash2, ExternalLink } from 'lucide-react';
import { TranslationSettings, GeminiModelId, TranslationDomain } from '../types';
import { ALL_LANGUAGES } from '../languages';
import { getStoredApiKey, setStoredApiKey, clearStoredApiKey } from '../lib/apiKeyStorage';

interface SettingsViewProps {
  settings: TranslationSettings;
  setSettings: React.Dispatch<React.SetStateAction<TranslationSettings>>;
  apiKeyConfigured: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  setSettings,
  apiKeyConfigured,
}) => {
  const [userKeyInput, setUserKeyInput] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [testingKey, setTestingKey] = useState<boolean>(false);
  const [keyMessage, setKeyMessage] = useState<{ success: boolean; text: string } | null>(null);

  useEffect(() => {
    setUserKeyInput(getStoredApiKey());
  }, []);

  const handleModelChange = (model: GeminiModelId) => {
    setSettings((prev) => ({ ...prev, defaultModel: model }));
  };

  const handleSaveKey = () => {
    setStoredApiKey(userKeyInput);
    setKeyMessage({ success: true, text: 'Đã lưu Gemini API Key thành công!' });
    setTimeout(() => setKeyMessage(null), 3000);
  };

  const handleClearKey = () => {
    clearStoredApiKey();
    setUserKeyInput('');
    setKeyMessage({ success: true, text: 'Đã xóa API Key cá nhân. Dùng cấu hình mặc định.' });
    setTimeout(() => setKeyMessage(null), 3000);
  };

  const handleTestKey = async () => {
    setTestingKey(true);
    setKeyMessage(null);
    try {
      const res = await fetch('/api/translate/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': userKeyInput.trim(),
        },
        body: JSON.stringify({
          text: 'Test connection',
          sourceLang: 'en',
          targetLang: 'vi',
          model: 'gemini-3.6-flash',
        }),
      });

      const data = await res.json();
      if (res.ok && data.translatedText) {
        setKeyMessage({ success: true, text: 'Kết nối thành công! API Key của bạn hoạt động hoàn hảo.' });
      } else {
        setKeyMessage({ success: false, text: data.error || 'API Key không hợp lệ.' });
      }
    } catch (e) {
      setKeyMessage({ success: false, text: 'Không thể kết nối máy chủ dịch thuật.' });
    } finally {
      setTestingKey(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-indigo-600" /> Cấu Hình Nền Tảng & AI
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Tùy chỉnh thông số dịch mặc định, quản lý API Key người dùng và nguyên tắc bảo toàn định dạng.
        </p>
      </div>

      {/* User Gemini API Key Configuration Panel */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-500" /> Gemini API Key Cá Nhân
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tự nhập khóa API của bạn để ứng dụng hoạt động không giới hạn.
            </p>
          </div>

          <div
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
              apiKeyConfigured
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            }`}
          >
            {apiKeyConfigured ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> {getStoredApiKey() ? 'API Key Cá Nhân Active' : 'API Key Mặc Định System'}
              </>
            ) : (
              'Chưa Có API Key'
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Nhập Gemini API Key (AIzaSy...):</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-[11px] font-bold"
            >
              Lấy API Key Miễn Phí Tại Google AI Studio <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={userKeyInput}
              onChange={(e) => setUserKeyInput(e.target.value)}
              placeholder="Dán Gemini API Key của bạn vào đây..."
              className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {keyMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
              keyMessage.success
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
            }`}
          >
            <span>{keyMessage.text}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          {userKeyInput ? (
            <button
              onClick={handleClearKey}
              className="px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Xóa API Key
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={!userKeyInput.trim() || testingKey}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {testingKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Kiểm Tra Key'}
            </button>

            <button
              type="button"
              onClick={handleSaveKey}
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
            >
              Lưu API Key
            </button>
          </div>
        </div>
      </div>

      {/* Default AI Model Preference */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-500" /> Tùy Chọn Mô Hình Mặc Định
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <button
            type="button"
            onClick={() => handleModelChange('gemini-3.6-flash')}
            className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${
              settings.defaultModel === 'gemini-3.6-flash'
                ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <p className="font-bold text-sm">Gemini 3.6 Flash</p>
            <p className="text-[11px] text-slate-400 font-normal">Tốc độ cực nhanh, hiệu năng cao, tối ưu dịch tài liệu thông thường.</p>
          </button>

          <button
            type="button"
            onClick={() => handleModelChange('gemini-3.1-pro-preview')}
            className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${
              settings.defaultModel === 'gemini-3.1-pro-preview'
                ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <p className="font-bold text-sm">Gemini 3.1 Pro</p>
            <p className="text-[11px] text-slate-400 font-normal">Xử lý định dạng phức tạp, lập luận chuyên sâu cho tài liệu pháp lý & học thuật.</p>
          </button>

          <button
            type="button"
            onClick={() => handleModelChange('gemini-3.6-flash-thinking')}
            className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${
              settings.defaultModel === 'gemini-3.6-flash-thinking'
                ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <p className="font-bold text-sm">Gemini Thinking High</p>
            <p className="text-[11px] text-slate-400 font-normal">Độ chính xác logic cao cho công thức toán học & mã nguồn phần mềm.</p>
          </button>
        </div>
      </div>

      {/* Format Preservation Toggles */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> Nguyên Tắc Bảo Toàn Bố Cục & Phần Tử
        </h3>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">Bảo Toàn Kiểu Chữ & Bố Cục Trang</span>
              <p className="text-[11px] text-slate-400">Giữ nguyên tiêu đề, in đậm, nghiêng, bảng biểu và danh sách dạng dấu chấm.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.preserveFormatting}
              onChange={(e) => setSettings((p) => ({ ...p, preserveFormatting: e.target.checked }))}
              className="w-4 h-4 accent-indigo-600"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">Bảo Vệ Công Thức Toán Học (LaTeX / MathML)</span>
              <p className="text-[11px] text-slate-400">Tuyệt đối không biến đổi các công thức toán hoặc ký hiệu ($...$, $$...$$).</p>
            </div>
            <input
              type="checkbox"
              checked={settings.preserveMathFormulas}
              onChange={(e) => setSettings((p) => ({ ...p, preserveMathFormulas: e.target.checked }))}
              className="w-4 h-4 accent-indigo-600"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">Bảo Vệ Khối Mã Nguồn Lập Trình</span>
              <p className="text-[11px] text-slate-400">Giữ nguyên cú pháp lập trình, tên biến và các đoạn code mẫu.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.preserveCodeBlocks}
              onChange={(e) => setSettings((p) => ({ ...p, preserveCodeBlocks: e.target.checked }))}
              className="w-4 h-4 accent-indigo-600"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
