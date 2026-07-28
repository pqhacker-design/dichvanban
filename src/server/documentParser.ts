import mammoth from 'mammoth';

export interface ParsedDocument {
  rawText: string;
  formattedContent: string; // Markdown or HTML representation
  fileType: string;
}

export async function parseDocumentBuffer(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<ParsedDocument> {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (ext === 'docx' || mimeType.includes('wordprocessingml')) {
    try {
      const result = await mammoth.convertToHtml({ buffer });
      const rawTextResult = await mammoth.extractRawText({ buffer });
      return {
        rawText: rawTextResult.value || result.value,
        formattedContent: result.value || rawTextResult.value,
        fileType: 'docx',
      };
    } catch (err) {
      console.error('Error parsing DOCX:', err);
      const str = buffer.toString('utf-8');
      return { rawText: str, formattedContent: str, fileType: 'docx' };
    }
  }

  if (ext === 'txt' || ext === 'md' || ext === 'csv' || ext === 'html' || ext === 'rtf') {
    const content = buffer.toString('utf-8');
    return {
      rawText: content,
      formattedContent: content,
      fileType: ext,
    };
  }

  // Default fallback for PDF, PPTX, XLSX, ODT or other binary formats
  // In a Node server without heavy native bindings, text chunks can be extracted from buffer or treated as utf-8 / binary string representation
  const content = buffer.toString('utf-8');
  // Clean up non-printable binary characters if needed
  const cleaned = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
  return {
    rawText: cleaned,
    formattedContent: cleaned,
    fileType: ext || 'doc',
  };
}
