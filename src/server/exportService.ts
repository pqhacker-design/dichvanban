import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Packer,
  HeadingLevel,
  BorderStyle,
  WidthType,
} from 'docx';

function unescapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function cleanResidualHtmlTags(str: string): string {
  if (!str) return '';
  return unescapeHtml(str.replace(/<[^>]+>/g, '')).trim();
}

function parseInlineHtmlAndMarkdown(input: string): TextRun[] {
  if (!input) return [new TextRun({ text: '' })];

  let text = input.replace(/<br\s*\/?>/gi, '\n');

  // Convert HTML inline formatting to Markdown syntax
  text = text.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  text = text.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
  text = text.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
  text = text.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');
  text = text.replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, '__$1__');
  text = text.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');

  // Strip all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');
  text = unescapeHtml(text);

  if (!text) return [new TextRun({ text: '' })];

  const runs: TextRun[] = [];
  const regex = /(\*\*[\s\S]*?\*\*|\*[\s\S]*?\*|__[\s\S]*?__|`[\s\S]*?`|[^*_`\n]+|\n)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const part = match[0];
    if (part === '\n') {
      runs.push(new TextRun({ text: '', break: 1 }));
    } else if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
    } else if (part.startsWith('__') && part.endsWith('__') && part.length > 4) {
      runs.push(new TextRun({ text: part.slice(2, -2), underline: {} }));
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

function parseHtmlTable(tableHtml: string): Table | null {
  const trMatches = tableHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi);
  if (!trMatches || trMatches.length === 0) return null;

  const rows: TableRow[] = [];

  trMatches.forEach((trHtml, rowIndex) => {
    const cellMatches = trHtml.match(/<(td|th)[^>]*>[\s\S]*?<\/(td|th)>/gi);
    if (!cellMatches || cellMatches.length === 0) return;

    const cells: TableCell[] = [];
    cellMatches.forEach((cellHtml) => {
      const isHeader = /^<th/i.test(cellHtml) || rowIndex === 0;
      const innerContent = cellHtml.replace(/^<(td|th)[^>]*>/i, '').replace(/<\/(td|th)>$/i, '');

      cells.push(
        new TableCell({
          children: [
            new Paragraph({
              children: parseInlineHtmlAndMarkdown(innerContent),
              spacing: { before: 60, after: 60 },
            }),
          ],
          shading: isHeader ? { fill: 'F1F5F9' } : undefined,
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
          },
        })
      );
    });

    if (cells.length > 0) {
      rows.push(new TableRow({ children: cells }));
    }
  });

  if (rows.length === 0) return null;

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  });
}

function parseMarkdownTable(tableLines: string[]): Table | null {
  const rows: TableRow[] = [];

  tableLines.forEach((line, index) => {
    if (line.includes('---')) return;
    const cellsRaw = line
      .split('|')
      .map((c) => c.trim())
      .filter((_, i, arr) => i > 0 && i < arr.length - 1);
    if (cellsRaw.length === 0) return;

    const isHeader = index === 0;
    const cells: TableCell[] = cellsRaw.map((cellText) => {
      return new TableCell({
        children: [
          new Paragraph({
            children: parseInlineHtmlAndMarkdown(cellText),
            spacing: { before: 60, after: 60 },
          }),
        ],
        shading: isHeader ? { fill: 'F1F5F9' } : undefined,
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
          left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
          right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
        },
      });
    });

    rows.push(new TableRow({ children: cells }));
  });

  if (rows.length === 0) return null;

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  });
}

export async function generateExportContent(
  content: string,
  format: 'docx' | 'pdf' | 'txt' | 'html' | 'md',
  title: string
): Promise<{ buffer: Buffer; mimeType: string; fileName: string }> {
  // Safe filename string (sanitize path characters, keep Unicode/Vietnamese)
  const safeTitle = (title || 'Translated_Document').replace(/[\/\\?%*:|"<>]/g, '_').trim();

  if (format === 'docx') {
    const docChildren: (Paragraph | Table)[] = [];

    // Document Title Heading
    if (title) {
      docChildren.push(
        new Paragraph({
          children: parseInlineHtmlAndMarkdown(title),
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 240 },
        })
      );
    }

    const hasHtmlTags = /<[a-z][\s\S]*?>/i.test(content);

    if (hasHtmlTags) {
      // Split content by major HTML block tags
      const blockRegex = /(<table[\s\S]*?<\/table>|<h[1-6][\s\S]*?<\/h[1-6]>|<p[\s\S]*?<\/p>|<ul[\s\S]*?<\/ul>|<ol[\s\S]*?<\/ol>|<blockquote[\s\S]*?<\/blockquote>|<pre[\s\S]*?<\/pre>)/gi;
      
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = blockRegex.exec(content)) !== null) {
        // Plain text or standalone content between block tags
        const precedingText = content.substring(lastIndex, match.index).trim();
        if (precedingText) {
          const lines = precedingText.split('\n');
          lines.forEach((line) => {
            const cleaned = cleanResidualHtmlTags(line);
            if (cleaned) {
              docChildren.push(
                new Paragraph({
                  children: parseInlineHtmlAndMarkdown(cleaned),
                  spacing: { after: 120 },
                })
              );
            }
          });
        }

        const blockHtml = match[0];
        lastIndex = blockRegex.lastIndex;

        if (/^<table/i.test(blockHtml)) {
          const tableObj = parseHtmlTable(blockHtml);
          if (tableObj) {
            docChildren.push(tableObj);
            docChildren.push(new Paragraph({ text: '', spacing: { after: 120 } }));
          }
        } else if (/^<h([1-6])/i.test(blockHtml)) {
          const hMatch = blockHtml.match(/^<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/i);
          if (hMatch) {
            const levelNum = parseInt(hMatch[1], 10);
            const headingText = cleanResidualHtmlTags(hMatch[2]);
            const headingMap: Record<number, typeof HeadingLevel.HEADING_1> = {
              1: HeadingLevel.HEADING_1,
              2: HeadingLevel.HEADING_2,
              3: HeadingLevel.HEADING_3,
              4: HeadingLevel.HEADING_4,
              5: HeadingLevel.HEADING_5,
              6: HeadingLevel.HEADING_6,
            };
            docChildren.push(
              new Paragraph({
                children: parseInlineHtmlAndMarkdown(headingText),
                heading: headingMap[levelNum] || HeadingLevel.HEADING_1,
                spacing: { before: 200, after: 100 },
              })
            );
          }
        } else if (/^<(ul|ol)/i.test(blockHtml)) {
          const liMatches = blockHtml.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
          if (liMatches) {
            liMatches.forEach((li) => {
              const inner = li.replace(/^<li[^>]*>/i, '').replace(/<\/li>$/i, '');
              const cleaned = cleanResidualHtmlTags(inner);
              if (cleaned) {
                docChildren.push(
                  new Paragraph({
                    children: parseInlineHtmlAndMarkdown(cleaned),
                    bullet: { level: 0 },
                    spacing: { after: 80 },
                  })
                );
              }
            });
          }
        } else if (/^<blockquote/i.test(blockHtml)) {
          const inner = blockHtml.replace(/^<blockquote[^>]*>/i, '').replace(/<\/blockquote>$/i, '');
          const cleaned = cleanResidualHtmlTags(inner);
          if (cleaned) {
            docChildren.push(
              new Paragraph({
                children: parseInlineHtmlAndMarkdown(cleaned),
                indent: { left: 720 },
                spacing: { after: 120 },
              })
            );
          }
        } else if (/^<pre/i.test(blockHtml)) {
          const inner = blockHtml.replace(/^<pre[^>]*>/i, '').replace(/<\/pre>$/i, '');
          const cleaned = cleanResidualHtmlTags(inner);
          if (cleaned) {
            docChildren.push(
              new Paragraph({
                children: [new TextRun({ text: cleaned, font: 'Courier New' })],
                spacing: { after: 120 },
              })
            );
          }
        } else if (/^<p/i.test(blockHtml)) {
          const inner = blockHtml.replace(/^<p[^>]*>/i, '').replace(/<\/p>$/i, '');
          const cleaned = cleanResidualHtmlTags(inner);
          if (cleaned) {
            docChildren.push(
              new Paragraph({
                children: parseInlineHtmlAndMarkdown(cleaned),
                spacing: { after: 120 },
              })
            );
          }
        }
      }

      // Remaining trailing text after last matched block
      const trailingText = content.substring(lastIndex).trim();
      if (trailingText) {
        const lines = trailingText.split('\n');
        lines.forEach((line) => {
          const cleaned = cleanResidualHtmlTags(line);
          if (cleaned) {
            docChildren.push(
              new Paragraph({
                children: parseInlineHtmlAndMarkdown(cleaned),
                spacing: { after: 120 },
              })
            );
          }
        });
      }
    } else {
      // Process Markdown and Plain Text document structure
      const lines = content.split('\n');
      let markdownTableBuffer: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const line = rawLine.trimEnd();

        // Check for Markdown table line
        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
          markdownTableBuffer.push(line.trim());
          continue;
        } else if (markdownTableBuffer.length > 0) {
          const tableObj = parseMarkdownTable(markdownTableBuffer);
          if (tableObj) {
            docChildren.push(tableObj);
            docChildren.push(new Paragraph({ text: '', spacing: { after: 120 } }));
          }
          markdownTableBuffer = [];
        }

        if (!line.trim()) {
          docChildren.push(new Paragraph({ text: '', spacing: { after: 80 } }));
          continue;
        }

        if (line.startsWith('# ')) {
          docChildren.push(
            new Paragraph({
              children: parseInlineHtmlAndMarkdown(line.replace('# ', '').trim()),
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 240, after: 120 },
            })
          );
        } else if (line.startsWith('## ')) {
          docChildren.push(
            new Paragraph({
              children: parseInlineHtmlAndMarkdown(line.replace('## ', '').trim()),
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            })
          );
        } else if (line.startsWith('### ')) {
          docChildren.push(
            new Paragraph({
              children: parseInlineHtmlAndMarkdown(line.replace('### ', '').trim()),
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 160, after: 80 },
            })
          );
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          const bulletText = line.substring(2).trim();
          docChildren.push(
            new Paragraph({
              children: parseInlineHtmlAndMarkdown(bulletText),
              bullet: { level: 0 },
              spacing: { after: 80 },
            })
          );
        } else {
          docChildren.push(
            new Paragraph({
              children: parseInlineHtmlAndMarkdown(line),
              spacing: { after: 120 },
            })
          );
        }
      }

      if (markdownTableBuffer.length > 0) {
        const tableObj = parseMarkdownTable(markdownTableBuffer);
        if (tableObj) {
          docChildren.push(tableObj);
        }
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docChildren.length > 0 ? docChildren : [new Paragraph({ text: cleanResidualHtmlTags(content) })],
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
    const cleanBody = content.includes('<p>') || content.includes('<div>') ? content : content.replace(/\n/g, '<br/>');
    const htmlDoc = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; padding: 40px; color: #1e293b; max-width: 900px; margin: 0 auto; }
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
  ${cleanBody}
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
  const plainText = cleanResidualHtmlTags(content);
  return {
    buffer: Buffer.from(plainText, 'utf-8'),
    mimeType: 'text/plain',
    fileName: `${safeTitle}.txt`,
  };
}
