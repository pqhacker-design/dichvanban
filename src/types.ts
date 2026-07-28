export type TranslationDomain =
  | 'general'
  | 'academic'
  | 'education'
  | 'business'
  | 'legal'
  | 'medical'
  | 'technical'
  | 'marketing'
  | 'programming';

export type GeminiModelId = 'gemini-3.6-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.6-flash-thinking';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
}

export interface GlossaryItem {
  id: string;
  sourceTerm: string;
  targetTerm: string;
  sourceLang: string;
  targetLang: string;
  notes?: string;
  createdAt: string;
}

export interface DoNotTranslateRule {
  id: string;
  text: string;
  category: 'brand' | 'email' | 'url' | 'code' | 'math' | 'product_id' | 'custom';
  createdAt: string;
}

export type DocumentStatus = 'queued' | 'uploading' | 'parsing' | 'translating' | 'completed' | 'error';

export interface DocumentBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'table' | 'list' | 'code' | 'math' | 'image' | 'header_footer';
  level?: number;
  originalText: string;
  translatedText?: string;
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    color?: string;
    fontFamily?: string;
    align?: 'left' | 'center' | 'right' | 'justify';
  };
}

export interface DocumentItem {
  id: string;
  fileName: string;
  fileType: string; // docx, pdf, txt, md, html, pptx, xlsx, csv, odt, rtf
  fileSize: number; // in bytes
  uploadTime: string;
  sourceLang: string;
  targetLang: string;
  domain: TranslationDomain;
  modelUsed: GeminiModelId;
  status: DocumentStatus;
  progress: number; // 0 to 100
  originalContent: string;
  translatedContent: string;
  blocks?: DocumentBlock[];
  error?: string;
}

export interface TranslationHistoryItem {
  id: string;
  fileName: string;
  fileType: string;
  sourceLang: string;
  targetLang: string;
  domain: TranslationDomain;
  modelUsed: GeminiModelId;
  characterCount: number;
  wordCount: number;
  fileSize: number;
  createdAt: string;
  status: 'completed' | 'failed';
  originalContentPreview: string;
  translatedContentPreview: string;
}

export interface TranslationSettings {
  defaultModel: GeminiModelId;
  defaultDomain: TranslationDomain;
  defaultSourceLang: string;
  defaultTargetLang: string;
  customPrompt: string;
  preserveFormatting: boolean;
  preserveMathFormulas: boolean;
  preserveCodeBlocks: boolean;
  theme: 'light' | 'dark' | 'system';
  uiLanguage: 'vi' | 'en';
  autoSaveHistory: boolean;
  fontFamily: 'sans' | 'serif' | 'mono';
}

export interface DashboardStats {
  totalDocuments: number;
  totalTranslations: number;
  totalProcessedBytes: number;
  totalWordsTranslated: number;
  topLanguages: { code: string; name: string; count: number }[];
  dailyChartData: { date: string; documents: number; words: number }[];
}
