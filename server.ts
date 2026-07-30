import express from 'express';
import path from 'path';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { translateText, translateTextStream, performOCRAndTranslate } from './src/server/geminiService';
import { parseDocumentBuffer, fixFilenameEncoding } from './src/server/documentParser';
import { generateExportContent } from './src/server/exportService';
import { store } from './src/server/store';
import { GeminiModelId, TranslationDomain } from './src/types';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// API Routes
app.get('/api/health', (req, res) => {
  const headerKey = req.headers['x-gemini-api-key'] as string;
  const envKey = process.env.GEMINI_API_KEY;
  const activeKey = headerKey?.trim() || envKey?.trim();
  res.json({
    status: 'ok',
    geminiKeyConfigured: Boolean(activeKey),
    isCustomKey: Boolean(headerKey?.trim()),
    models: ['gemini-3.6-flash', 'gemini-3.1-pro-preview', 'gemini-3.6-flash-thinking'],
  });
});

app.get('/api/stats', (req, res) => {
  res.json(store.getStats());
});

app.get('/api/glossary', (req, res) => {
  res.json({
    glossary: store.getGlossary(),
    doNotTranslateRules: store.getDoNotTranslateRules(),
  });
});

app.post('/api/glossary', (req, res) => {
  const { sourceTerm, targetTerm, sourceLang, targetLang, notes } = req.body;
  if (!sourceTerm || !targetTerm) {
    res.status(400).json({ error: 'sourceTerm and targetTerm are required' });
    return;
  }
  const newItem = store.addGlossaryItem({
    sourceTerm,
    targetTerm,
    sourceLang: sourceLang || 'vi',
    targetLang: targetLang || 'en',
    notes,
  });
  res.json(newItem);
});

app.delete('/api/glossary/:id', (req, res) => {
  const success = store.deleteGlossaryItem(req.params.id);
  res.json({ success });
});

app.post('/api/rules', (req, res) => {
  const { text, category } = req.body;
  if (!text) {
    res.status(400).json({ error: 'text is required' });
    return;
  }
  const newRule = store.addDoNotTranslateRule({
    text,
    category: category || 'brand',
  });
  res.json(newRule);
});

app.delete('/api/rules/:id', (req, res) => {
  const success = store.deleteDoNotTranslateRule(req.params.id);
  res.json({ success });
});

app.get('/api/history', (req, res) => {
  res.json(store.getHistory());
});

app.delete('/api/history/:id', (req, res) => {
  const success = store.deleteHistoryItem(req.params.id);
  res.json({ success });
});

app.delete('/api/history', (req, res) => {
  store.clearHistory();
  res.json({ success: true });
});

app.post('/api/translate/text', async (req, res) => {
  try {
    const { text, sourceLang, targetLang, model, domain, customPrompt } = req.body;
    const userApiKey = (req.headers['x-gemini-api-key'] as string) || req.body?.apiKey;

    if (!text || !targetLang) {
      res.status(400).json({ error: 'text and targetLang are required' });
      return;
    }

    const glossary = store.getGlossary();
    const rules = store.getDoNotTranslateRules();

    const translatedText = await translateText(
      text,
      sourceLang || 'auto',
      targetLang,
      model as GeminiModelId,
      domain as TranslationDomain,
      customPrompt,
      glossary,
      rules,
      userApiKey
    );

    // Save to history log
    store.addHistoryItem({
      fileName: 'Text_Translation_' + new Date().toISOString().slice(0, 10),
      fileType: 'txt',
      sourceLang: sourceLang || 'auto',
      targetLang,
      domain: domain || 'general',
      modelUsed: model || 'gemini-3.6-flash',
      characterCount: text.length,
      wordCount: text.trim().split(/\s+/).length,
      fileSize: Buffer.byteLength(text, 'utf-8'),
      status: 'completed',
      originalContentPreview: text.substring(0, 150),
      translatedContentPreview: translatedText.substring(0, 150),
    });

    res.json({ translatedText });
  } catch (error: any) {
    console.error('Translation error:', error);
    res.status(500).json({ error: error.message || 'Translation failed' });
  }
});

app.post('/api/translate/stream', async (req, res) => {
  try {
    const { text, sourceLang, targetLang, model, domain, customPrompt } = req.body;
    const userApiKey = (req.headers['x-gemini-api-key'] as string) || req.body?.apiKey;

    if (!text || !targetLang) {
      res.status(400).json({ error: 'text and targetLang are required' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const glossary = store.getGlossary();
    const rules = store.getDoNotTranslateRules();

    await translateTextStream(
      text,
      sourceLang || 'auto',
      targetLang,
      (chunkText) => {
        res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
      },
      model as GeminiModelId,
      domain as TranslationDomain,
      customPrompt,
      glossary,
      rules,
      userApiKey
    );

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Stream error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message || 'Stream failed' })}\n\n`);
    res.end();
  }
});

app.post('/api/translate/document', upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const { sourceLang, targetLang, model, domain, customPrompt } = req.body;
    const userApiKey = (req.headers['x-gemini-api-key'] as string) || req.body?.apiKey;

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const glossary = store.getGlossary();
    const rules = store.getDoNotTranslateRules();

    const results = [];

    for (const file of files) {
      const fixedName = fixFilenameEncoding(file.originalname);
      const parsed = await parseDocumentBuffer(file.buffer, fixedName, file.mimetype);

      const translatedText = await translateText(
        parsed.formattedContent,
        sourceLang || 'auto',
        targetLang || 'en',
        model as GeminiModelId,
        domain as TranslationDomain,
        customPrompt,
        glossary,
        rules,
        userApiKey
      );

      const docItem = {
        id: 'doc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        fileName: fixedName,
        fileType: parsed.fileType,
        fileSize: file.size,
        uploadTime: new Date().toISOString(),
        sourceLang: sourceLang || 'auto',
        targetLang: targetLang || 'en',
        domain: (domain as TranslationDomain) || 'general',
        modelUsed: (model as GeminiModelId) || 'gemini-3.6-flash',
        status: 'completed' as const,
        progress: 100,
        originalContent: parsed.formattedContent,
        translatedContent: translatedText,
      };

      store.addHistoryItem({
        fileName: docItem.fileName,
        fileType: docItem.fileType,
        sourceLang: docItem.sourceLang,
        targetLang: docItem.targetLang,
        domain: docItem.domain,
        modelUsed: docItem.modelUsed,
        characterCount: parsed.formattedContent.length,
        wordCount: parsed.formattedContent.trim().split(/\s+/).length,
        fileSize: docItem.fileSize,
        status: 'completed',
        originalContentPreview: parsed.formattedContent.substring(0, 150),
        translatedContentPreview: translatedText.substring(0, 150),
      });

      results.push(docItem);
    }

    res.json({ documents: results });
  } catch (error: any) {
    console.error('Document translation error:', error);
    res.status(500).json({ error: error.message || 'Document translation failed' });
  }
});

app.post('/api/ocr', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { targetLang, sourceLang } = req.body;
    const userApiKey = (req.headers['x-gemini-api-key'] as string) || req.body?.apiKey;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded for OCR' });
      return;
    }

    const base64Image = file.buffer.toString('base64');
    const mimeType = file.mimetype || 'image/png';

    const ocrResult = await performOCRAndTranslate(
      base64Image,
      mimeType,
      targetLang || 'vi',
      sourceLang || 'auto',
      userApiKey
    );

    res.json(ocrResult);
  } catch (error: any) {
    console.error('OCR Error:', error);
    res.status(500).json({ error: error.message || 'OCR processing failed' });
  }
});

app.post('/api/export', async (req, res) => {
  try {
    const { content, format, title } = req.body;
    if (!content || !format) {
      res.status(400).json({ error: 'content and format are required' });
      return;
    }

    const cleanTitle = fixFilenameEncoding(title || 'Translated_Document');
    const exportData = await generateExportContent(content, format, cleanTitle);
    
    const encodedFileName = encodeURIComponent(exportData.fileName);
    res.setHeader('Content-Type', exportData.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`
    );
    res.send(exportData.buffer);
  } catch (error: any) {
    console.error('Export Error:', error);
    res.status(500).json({ error: error.message || 'Export failed' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Document Translator Pro running on http://localhost:${PORT}`);
  });
}

startServer();
