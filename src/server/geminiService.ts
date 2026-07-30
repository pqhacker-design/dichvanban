import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { GeminiModelId, TranslationDomain, GlossaryItem, DoNotTranslateRule } from '../types';

function getGeminiClient(customApiKey?: string) {
  const apiKey = customApiKey?.trim();
  if (!apiKey) {
    throw new Error('Chưa nhập Gemini API Key cá nhân. Vui lòng bấm vào nút "Nhập API Key" trên thanh tiêu đề hoặc truy cập Cài Đặt để nhập API Key của bạn.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function buildSystemInstruction(
  sourceLang: string,
  targetLang: string,
  domain: TranslationDomain,
  customPrompt?: string,
  glossaryItems: GlossaryItem[] = [],
  doNotTranslateRules: DoNotTranslateRule[] = []
): string {
  const domainInstructions: Record<TranslationDomain, string> = {
    general: 'Translate accurately with a natural, professional tone.',
    academic: 'Translate in a scholarly, academic tone. Maintain precise terminology and formal style.',
    education: 'Translate with an educational, engaging, clear, and pedagogically sound tone.',
    business: 'Translate with a professional corporate business tone suitable for executive communications.',
    legal: 'Translate with high legal precision. Maintain formal legal phrasing, statutory structure, and exact terminology.',
    medical: 'Translate with utmost medical accuracy using standard clinical and anatomical terminology.',
    technical: 'Translate using precise engineering and technical terminology with exact clarity.',
    marketing: 'Translate with persuasive, captivating, and culturally adapted marketing copy.',
    programming: 'Translate comments and documentation while preserving code syntax, variable names, and programming keywords intact.',
  };

  let instruction = `You are a world-class AI Document Translator Pro expert.
Your primary directive is to translate the source text from ${sourceLang === 'auto' ? 'Auto-Detected Language' : sourceLang} into ${targetLang}.

CRITICAL PRESERVATION RULES:
1. PRESERVE DOCUMENT FORMATTING: Keep all Markdown headers (#, ##), bullet points (-), numbered lists (1.), tables (| ... |), bold (**text**), italics (*text*), blockquotes (>), code blocks (\`\`\`...\`\`\`), inline code (\`...\`), and hyperlinks intact.
2. DO NOT TRANSLATE FORMULAS & MATH: Keep LaTeX expressions (e.g., $...$, $$...$$), MathML, and equations untouched.
3. DO NOT TRANSLATE URLs, EMAILS, OR PRODUCT IDs: Leave web addresses, email addresses, code identifiers, and product codes exactly as they are.
4. STYLISTIC DOMAIN: ${domainInstructions[domain] || domainInstructions.general}
`;

  if (glossaryItems.length > 0) {
    instruction += `\nSTRICT GLOSSARY MANDATE (You MUST use these exact translations for the listed terms):\n`;
    glossaryItems.forEach((item) => {
      instruction += `- "${item.sourceTerm}" -> "${item.targetTerm}"\n`;
    });
  }

  if (doNotTranslateRules.length > 0) {
    instruction += `\nDO NOT TRANSLATE LIST (Keep the following exact strings unchanged in the source text):\n`;
    doNotTranslateRules.forEach((rule) => {
      instruction += `- "${rule.text}"\n`;
    });
  }

  if (customPrompt && customPrompt.trim().length > 0) {
    instruction += `\nUSER CUSTOM TRANSLATION INSTRUCTIONS:\n${customPrompt.trim()}\n`;
  }

  instruction += `\nRespond ONLY with the complete, fully translated document. Do NOT add conversational filler, intros, or explanations outside the translation.`;

  return instruction;
}

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
  modelId: GeminiModelId = 'gemini-3.6-flash',
  domain: TranslationDomain = 'general',
  customPrompt?: string,
  glossaryItems: GlossaryItem[] = [],
  doNotTranslateRules: DoNotTranslateRule[] = [],
  customApiKey?: string
): Promise<string> {
  const ai = getGeminiClient(customApiKey);
  const systemInstruction = buildSystemInstruction(
    sourceLang,
    targetLang,
    domain,
    customPrompt,
    glossaryItems,
    doNotTranslateRules
  );

  let targetModel = 'gemini-3.6-flash';
  let thinkingConfig = undefined;

  if (modelId === 'gemini-3.1-pro-preview') {
    targetModel = 'gemini-3.1-pro-preview';
  } else if (modelId === 'gemini-3.6-flash-thinking') {
    targetModel = 'gemini-3.6-flash';
    thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
  }

  const response = await ai.models.generateContent({
    model: targetModel,
    contents: text,
    config: {
      systemInstruction,
      ...(thinkingConfig ? { thinkingConfig } : {}),
    },
  });

  return response.text || '';
}

export async function translateTextStream(
  text: string,
  sourceLang: string,
  targetLang: string,
  onChunk: (chunkText: string) => void,
  modelId: GeminiModelId = 'gemini-3.6-flash',
  domain: TranslationDomain = 'general',
  customPrompt: string = '',
  glossaryItems: GlossaryItem[] = [],
  doNotTranslateRules: DoNotTranslateRule[] = [],
  customApiKey?: string
): Promise<void> {
  const ai = getGeminiClient(customApiKey);
  const systemInstruction = buildSystemInstruction(
    sourceLang,
    targetLang,
    domain,
    customPrompt,
    glossaryItems,
    doNotTranslateRules
  );

  let targetModel = 'gemini-3.6-flash';
  let thinkingConfig = undefined;

  if (modelId === 'gemini-3.1-pro-preview') {
    targetModel = 'gemini-3.1-pro-preview';
  } else if (modelId === 'gemini-3.6-flash-thinking') {
    targetModel = 'gemini-3.6-flash';
    thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
  }

  const responseStream = await ai.models.generateContentStream({
    model: targetModel,
    contents: text,
    config: {
      systemInstruction,
      ...(thinkingConfig ? { thinkingConfig } : {}),
    },
  });

  for await (const chunk of responseStream) {
    if (chunk.text) {
      onChunk(chunk.text);
    }
  }
}

export async function performOCRAndTranslate(
  base64Image: string,
  mimeType: string,
  targetLang: string,
  sourceLang: string = 'auto',
  customApiKey?: string
): Promise<{ extractedText: string; translatedText: string }> {
  const ai = getGeminiClient(customApiKey);

  const ocrResponse = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: [
      {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      },
      {
        text: 'Perform high-accuracy Optical Character Recognition (OCR) on this document or image. Extract all text accurately, maintaining original paragraph breaks, headings, tables, and list structure. Return ONLY the extracted text.',
      },
    ],
  });

  const extractedText = ocrResponse.text || '';

  const translatedText = await translateText(
    extractedText,
    sourceLang,
    targetLang,
    'gemini-3.6-flash',
    'general',
    '',
    [],
    [],
    customApiKey
  );

  return { extractedText, translatedText };
}
