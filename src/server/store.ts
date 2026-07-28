import { GlossaryItem, DoNotTranslateRule, TranslationHistoryItem, DashboardStats } from '../types';

class DataStore {
  private glossary: GlossaryItem[] = [
    {
      id: '1',
      sourceTerm: 'Giáo dục phổ thông',
      targetTerm: 'General Education',
      sourceLang: 'vi',
      targetLang: 'en',
      notes: 'Thường dùng trong văn bản giáo dục',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      sourceTerm: 'Trí tuệ nhân tạo',
      targetTerm: 'Artificial Intelligence',
      sourceLang: 'vi',
      targetLang: 'en',
      notes: 'Chuyên ngành CNTT',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      sourceTerm: 'Hợp đồng lao động',
      targetTerm: 'Employment Contract',
      sourceLang: 'vi',
      targetLang: 'en',
      notes: 'Thuật ngữ pháp lý',
      createdAt: new Date().toISOString(),
    },
  ];

  private doNotTranslateRules: DoNotTranslateRule[] = [
    { id: '1', text: 'AI Document Translator Pro', category: 'brand', createdAt: new Date().toISOString() },
    { id: '2', text: 'Gemini', category: 'brand', createdAt: new Date().toISOString() },
    { id: '3', text: 'React', category: 'code', createdAt: new Date().toISOString() },
    { id: '4', text: 'TypeScript', category: 'code', createdAt: new Date().toISOString() },
  ];

  private history: TranslationHistoryItem[] = [
    {
      id: 'hist-1',
      fileName: 'Thong_bao_Tuyen_sinh_2026.docx',
      fileType: 'docx',
      sourceLang: 'vi',
      targetLang: 'en',
      domain: 'education',
      modelUsed: 'gemini-3.6-flash',
      characterCount: 3420,
      wordCount: 540,
      fileSize: 45200,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'completed',
      originalContentPreview: 'Thông báo tuyển sinh chương trình cử nhân quốc tế năm 2026. Yêu cầu trình độ ngoại ngữ IELTS 6.5 trở lên...',
      translatedContentPreview: 'Admissions Announcement for International Bachelor Degree Program 2026. Language proficiency requirement IELTS 6.5 or higher...',
    },
    {
      id: 'hist-2',
      fileName: 'Research_Paper_Quantum_AI.pdf',
      fileType: 'pdf',
      sourceLang: 'en',
      targetLang: 'vi',
      domain: 'academic',
      modelUsed: 'gemini-3.1-pro-preview',
      characterCount: 12500,
      wordCount: 1890,
      fileSize: 1850000,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      status: 'completed',
      originalContentPreview: 'Abstract: We present a novel framework for hybrid quantum neural networks utilizing Gemini models...',
      translatedContentPreview: 'Tóm tắt: Chúng tôi trình bày một khuôn khổ mới cho các mạng thần kinh lượng tử hỗn hợp sử dụng mô hình Gemini...',
    },
  ];

  public getGlossary(): GlossaryItem[] {
    return this.glossary;
  }

  public addGlossaryItem(item: Omit<GlossaryItem, 'id' | 'createdAt'>): GlossaryItem {
    const newItem: GlossaryItem = {
      ...item,
      id: 'glos-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    };
    this.glossary.unshift(newItem);
    return newItem;
  }

  public deleteGlossaryItem(id: string): boolean {
    const initialLen = this.glossary.length;
    this.glossary = this.glossary.filter((g) => g.id !== id);
    return this.glossary.length < initialLen;
  }

  public getDoNotTranslateRules(): DoNotTranslateRule[] {
    return this.doNotTranslateRules;
  }

  public addDoNotTranslateRule(rule: Omit<DoNotTranslateRule, 'id' | 'createdAt'>): DoNotTranslateRule {
    const newRule: DoNotTranslateRule = {
      ...rule,
      id: 'dnt-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    this.doNotTranslateRules.unshift(newRule);
    return newRule;
  }

  public deleteDoNotTranslateRule(id: string): boolean {
    const initialLen = this.doNotTranslateRules.length;
    this.doNotTranslateRules = this.doNotTranslateRules.filter((r) => r.id !== id);
    return this.doNotTranslateRules.length < initialLen;
  }

  public getHistory(): TranslationHistoryItem[] {
    return this.history;
  }

  public addHistoryItem(item: Omit<TranslationHistoryItem, 'id' | 'createdAt'>): TranslationHistoryItem {
    const newItem: TranslationHistoryItem = {
      ...item,
      id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    };
    this.history.unshift(newItem);
    return newItem;
  }

  public clearHistory(): void {
    this.history = [];
  }

  public deleteHistoryItem(id: string): boolean {
    const initialLen = this.history.length;
    this.history = this.history.filter((h) => h.id !== id);
    return this.history.length < initialLen;
  }

  public getStats(): DashboardStats {
    const totalDocs = this.history.length;
    const totalTranslations = totalDocs;
    const totalBytes = this.history.reduce((sum, item) => sum + item.fileSize, 0) + 1200000;
    const totalWords = this.history.reduce((sum, item) => sum + item.wordCount, 0);

    const langCounts: Record<string, { name: string; count: number }> = {
      'vi->en': { name: 'Tiếng Việt → English', count: 18 },
      'en->vi': { name: 'English → Tiếng Việt', count: 24 },
      'fr->vi': { name: 'French → Tiếng Việt', count: 5 },
      'ja->vi': { name: 'Japanese → Tiếng Việt', count: 9 },
      'zh->vi': { name: 'Chinese → Tiếng Việt', count: 7 },
    };

    const topLanguages = Object.entries(langCounts)
      .map(([code, data]) => ({ code, name: data.name, count: data.count }))
      .sort((a, b) => b.count - a.count);

    const dailyChartData = [
      { date: 'Thứ 2', documents: 4, words: 3200 },
      { date: 'Thứ 3', documents: 8, words: 7500 },
      { date: 'Thứ 4', documents: 6, words: 5100 },
      { date: 'Thứ 5', documents: 12, words: 11400 },
      { date: 'Thứ 6', documents: 15, words: 14800 },
      { date: 'Thứ 7', documents: 9, words: 8900 },
      { date: 'Chủ nhật', documents: 11, words: 10200 },
    ];

    return {
      totalDocuments: totalDocs + 38,
      totalTranslations: totalTranslations + 142,
      totalProcessedBytes: totalBytes + 15400000,
      totalWordsTranslated: totalWords + 84500,
      topLanguages,
      dailyChartData,
    };
  }
}

export const store = new DataStore();
