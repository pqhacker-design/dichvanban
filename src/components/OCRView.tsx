import React, { useState, useRef } from 'react';
import { ScanText, Upload, Sparkles, RefreshCw, Copy, Check, FileImage, Eye } from 'lucide-react';
import { ALL_LANGUAGES, getLanguageName } from '../languages';
import { getApiKeyHeaders } from '../lib/apiKeyStorage';

interface OCRViewProps {
  targetLang: string;
  setTargetLang: (lang: string) => void;
}

export const OCRView: React.FC<OCRViewProps> = ({ targetLang, setTargetLang }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setExtractedText('');
      setTranslatedText('');
    }
  };

  const handleRunOCR = async () => {
    if (!selectedImage) return;

    setProcessing(true);
    const formData = new FormData();
    formData.append('file', selectedImage);
    formData.append('targetLang', targetLang);

    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          ...getApiKeyHeaders(),
        },
        body: formData,
      });

      if (!res.ok) throw new Error('OCR process failed');

      const data = await res.json();
      setExtractedText(data.extractedText || '');
      setTranslatedText(data.translatedText || '');
    } catch (e) {
      console.error('OCR Error:', e);
      alert('OCR failed. Please check your image format and API key.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText || extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <ScanText className="w-7 h-7 text-indigo-600" /> Nhận Dạng Chữ OCR & Dịch Thuật
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Trích xuất và dịch thuật bản in, ảnh chụp tài liệu, PDF hoặc infographics bằng AI Gemini Vision.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ngôn Ngữ Đích:</span>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload & Image Canvas Box */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <FileImage className="w-4 h-4 text-indigo-500" /> Hình Ảnh Đầu Vào
          </h3>

          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-500/40 dark:border-indigo-500/30 hover:border-indigo-600 rounded-2xl h-80 flex flex-col items-center justify-center p-6 text-center cursor-pointer bg-indigo-50/20 dark:bg-slate-900/40 transition-colors"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*,.pdf"
                className="hidden"
              />
              <Upload className="w-10 h-10 text-indigo-500 mb-3" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Tải Ảnh Tài Liệu Hoặc Trang PDF
              </p>
              <p className="text-xs text-slate-400 mt-1">Hỗ trợ PNG, JPG, WEBP, BMP tối đa 20MB</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-80 bg-black/5 flex items-center justify-center">
                <img src={previewUrl} alt="OCR Source" className="max-h-80 object-contain" />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  Đổi Ảnh Khác
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*,.pdf"
                  className="hidden"
                />

                <button
                  onClick={handleRunOCR}
                  disabled={processing}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md shadow-indigo-600/20"
                >
                  {processing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Đang Quét Bằng Gemini Vision...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Quét OCR & Dịch Thuật
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* OCR Result Box */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500" /> Kết Quả Trích Xuất & Dịch Thuật
              </h3>
              {(translatedText || extractedText) && (
                <button
                  onClick={handleCopy}
                  className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-semibold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Đã chép' : 'Sao chép'}
                </button>
              )}
            </div>

            <div className="mt-4 h-80 overflow-y-auto space-y-4 pr-1">
              {translatedText ? (
                <div>
                  <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    VĂN BẢN ĐÃ DỊCH ({getLanguageName(targetLang)})
                  </h4>
                  <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-500/20 text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                    {translatedText}
                  </div>
                </div>
              ) : extractedText ? (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 mb-1">VĂN BẢN OCR NGUYÊN BẢN</h4>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                    {extractedText}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                  Tải ảnh lên và bấm "Quét OCR & Dịch Thuật" để trích xuất văn bản tài liệu.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
