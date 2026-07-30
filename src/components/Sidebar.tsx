import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Languages,
  ScanText,
  History,
  BookMarked,
  Settings,
  KeyRound,
  Info,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'document'
  | 'text'
  | 'ocr'
  | 'history'
  | 'glossary'
  | 'settings'
  | 'api'
  | 'about';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Bảng điều khiển', icon: LayoutDashboard, badge: null },
    { id: 'document' as NavTab, label: 'Dịch tài liệu', icon: FileText, badge: 'PRO' },
    { id: 'text' as NavTab, label: 'Dịch văn bản', icon: Languages, badge: null },
    { id: 'ocr' as NavTab, label: 'Quét OCR hình ảnh', icon: ScanText, badge: 'AI' },
    { id: 'history' as NavTab, label: 'Lịch sử dịch', icon: History, badge: null },
    { id: 'glossary' as NavTab, label: 'Thuật ngữ & Quy tắc', icon: BookMarked, badge: null },
    { id: 'settings' as NavTab, label: 'Cài đặt', icon: Settings, badge: null },
    { id: 'api' as NavTab, label: 'Cấu hình API', icon: KeyRound, badge: null },
    { id: 'about' as NavTab, label: 'Giới thiệu', icon: Info, badge: null },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col justify-between shrink-0 select-none transition-all duration-300">
      <div>
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              AI Translator Pro
            </h1>
            <p className="text-[11px] text-indigo-400 font-medium">Gemini 3 Powered</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Model Indicator Footer */}
      <div className="p-4 m-3 rounded-2xl bg-slate-800/50 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300">Động cơ AI Gemini</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          Giữ nguyên định dạng & tổng hợp tài liệu AI đa mô hình đang hoạt động.
        </p>
      </div>
    </aside>
  );
};
