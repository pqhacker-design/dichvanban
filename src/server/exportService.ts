import { Document, Paragraph, TextRun, Packer, HeadingLevel } from 'docx';

function parseInlineMarkdownRuns(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|[^*`]+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const part = match[0];
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
    } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      runs.push(new TextRun({ text: part.slice(1, -1), italics: true }));
    } else if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      runs.push(new TextRun({ text: part.slice(1, -1), font: 'Courier New' }));
    } else {
      runs.push(new TextRun({ text: part }));
    }
  }

  return runs.length > 0 ? runs : [new TextRun({ text })];
}

export async function generateExportContent(
  content: string,
  format: 'docx' | 'pdf' | 'txt' | 'html' | 'md',
  title: string
): Promise<{ buffer: Buffer; mimeType: string; fileName: string }> {
  const safeTitle = title.replace(/[^a-zA-Z0-9_\-]/g, '_');

  if (format === 'docx') {
    const lines = content.split('\n');
    const docChildren: Paragraph[] = [];

    if (title) {
      docChildren.push(
        new Paragraph({
          text: title.replace(/_/g, ' '),
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        })
      );
    }

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();

      if (!line.trim()) {
        docChildren.push(new Paragraph({ text: '', spacing: { after: 120 } }));
        continue;
      }

      if (line.startsWith('# ')) {
        docChildren.push(
          new Paragraph({
            text: line.replace('# ', '').trim(),
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
          })
        );
      } else if (line.startsWith('## ')) {
        docChildren.push(
          new Paragraph({
            text: line.replace('## ', '').trim(),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );
      } else if (line.startsWith('### ')) {
        docChildren.push(
          new Paragraph({
            text: line.replace('### ', '').trim(),
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 160, after: 80 },
          })
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        const bulletText = line.substring(2).trim();
        docChildren.push(
          new Paragraph({
            children: parseInlineMarkdownRuns(bulletText),
            bullet: { level: 0 },
            spacing: { after: 80 },
          })
        );
      } else {
        const runs = parseInlineMarkdownRuns(line);
        docChildren.push(
          new Paragraph({
            children: runs,
            spacing: { after: 120 },
          })
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docChildren.length > 0 ? docChildren : [new Paragraph({ text: content })],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    return {
      buffer,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileName: `${safeTitle}.docx`,
    };
  }

  if (format === 'html' || format === 'pdf') {
    const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
    h1, h2, h3 { color: #0f172a; margin-top: 1.5em; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background-color: #f1f5f9; }
    code { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
    pre { background-color: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; }
    blockquote { border-left: 4px solid #3b82f6; margin: 0; padding-left: 16px; color: #475569; }
  </style>
</head>
<body>
  ${content.replace(/\n/g, '<br/>')}
</body>
</html>`;

    return {
      buffer: Buffer.from(htmlDoc, 'utf-8'),
      mimeType: format === 'pdf' ? 'application/pdf' : 'text/html',
      fileName: `${safeTitle}.${format === 'pdf' ? 'html' : 'html'}`,
    };
  }

  if (format === 'md') {
    return {
      buffer: Buffer.from(content, 'utf-8'),
      mimeType: 'text/markdown',
      fileName: `${safeTitle}.md`,
    };
  }

  // Fallback to txt
  return {
    buffer: Buffer.from(content, 'utf-8'),
    mimeType: 'text/plain',
    fileName: `${safeTitle}.txt`,
  };
}
