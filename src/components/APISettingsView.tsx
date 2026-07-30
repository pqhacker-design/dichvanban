import React, { useState, useEffect } from 'react';
import { KeyRound, Activity, CheckCircle2, AlertCircle, RefreshCw, Server, Zap } from 'lucide-react';
import { getApiKeyHeaders, getStoredApiKey } from '../lib/apiKeyStorage';

export const APISettingsView: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health', {
        headers: { ...getApiKeyHeaders() },
      });
      const data = await res.json();
      setHealthData(data);
    } catch (e) {
      console.error('API health check error:', e);
    }
  };

  const handleTestTranslation = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/translate/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getApiKeyHeaders(),
        },
        body: JSON.stringify({
          text: 'Hello, world! Welcome to AI Document Translator Pro.',
          sourceLang: 'en',
          targetLang: 'vi',
          model: 'gemini-3.6-flash',
        }),
      });
      const data = await res.json();
      setTestResult(data.translatedText || data.error || 'Error');
    } catch (e) {
      setTestResult('API test failed. Verify server response.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <KeyRound className="w-7 h-7 text-indigo-600" /> Chẩn Đoán API & Trạng Thái Mô Hình
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Theo dõi trạng thái máy chủ, endpoint backend và kiểm tra phản hồi các mô hình AI Gemini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Trạng Thái Máy Chủ
            </h3>
            <button
              onClick={checkHealth}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800"
              title="Làm mới trạng thái"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Luồng Máy Chủ:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Express / Node.js</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Cổng Lắng Nghe:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">0.0.0.0:3000</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Trạng Thái Gemini Key:</span>
              <span className="font-bold text-emerald-500">
                {healthData?.geminiKeyConfigured ? 'Hoạt động (Active)' : 'Chưa cấu hình'}
              </span>
            </div>
          </div>
        </div>

        {/* Model Test Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Thử Nghiệm Gọi Gemini Trực Tiếp
          </h3>

          <p className="text-xs text-slate-400">
            Gửi yêu cầu dịch mẫu tới mô hình `gemini-3.6-flash` qua Express backend.
          </p>

          <button
            onClick={handleTestTranslation}
            disabled={testing}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Chạy Thử Yêu Cầu'}
          </button>

          {testResult && (
            <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-500/20 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <span className="text-indigo-500 text-[10px] block font-bold mb-1">PHẢN HỒI KẾT QUẢ:</span>
              {testResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
