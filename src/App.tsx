import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TranslateDocumentView } from './components/TranslateDocumentView';
import { TranslateTextView } from './components/TranslateTextView';
import { OCRView } from './components/OCRView';
import { HistoryView } from './components/HistoryView';
import { GlossaryView } from './components/GlossaryView';
import { SettingsView } from './components/SettingsView';
import { APISettingsView } from './components/APISettingsView';
import { AboutView } from './components/AboutView';
import { TranslationSettings } from './types';
import { getStoredApiKey } from './lib/apiKeyStorage';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [targetLang, setTargetLang] = useState<string>('vi');
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean>(true);

  const [settings, setSettings] = useState<TranslationSettings>({
    defaultModel: 'gemini-3.6-flash',
    defaultDomain: 'general',
    defaultSourceLang: 'auto',
    defaultTargetLang: 'vi',
    customPrompt: '',
    preserveFormatting: true,
    preserveMathFormulas: true,
    preserveCodeBlocks: true,
    theme: 'dark',
    uiLanguage: 'vi',
    autoSaveHistory: true,
    fontFamily: 'sans',
  });

  useEffect(() => {
    // Check dark mode state on document body
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const checkApiKeyStatus = () => {
    const customKey = getStoredApiKey();
    if (!customKey) {
      setApiKeyConfigured(false);
      return;
    }
    fetch('/api/health', {
      headers: { 'x-gemini-api-key': customKey },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.geminiKeyConfigured === 'boolean') {
          setApiKeyConfigured(data.geminiKeyConfigured);
        }
      })
      .catch((err) => {
        console.error('Failed to connect to backend health endpoint:', err);
      });
  };

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-indigo-500/20 selection:text-indigo-400">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          targetLang={targetLang}
          setTargetLang={setTargetLang}
          apiKeyConfigured={apiKeyConfigured}
          onApiKeyUpdated={checkApiKeyStatus}
        />

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
          {activeTab === 'document' && (
            <TranslateDocumentView targetLang={targetLang} setTargetLang={setTargetLang} />
          )}
          {activeTab === 'text' && (
            <TranslateTextView targetLang={targetLang} setTargetLang={setTargetLang} />
          )}
          {activeTab === 'ocr' && <OCRView targetLang={targetLang} setTargetLang={setTargetLang} />}
          {activeTab === 'history' && <HistoryView />}
          {activeTab === 'glossary' && <GlossaryView />}
          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              setSettings={setSettings}
              apiKeyConfigured={apiKeyConfigured}
            />
          )}
          {activeTab === 'api' && <APISettingsView />}
          {activeTab === 'about' && <AboutView />}
        </main>
      </div>
    </div>
  );
}
