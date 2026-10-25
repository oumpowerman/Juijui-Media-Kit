import React from 'react';

interface MarkdownViewProps {
  content: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  if (!content) return null;

  // Split by line to render markdown elements accurately
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let tableBuffer: string[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  const flushTable = (index: number) => {
    if (tableBuffer.length === 0) return;

    const rows = tableBuffer
      .filter((line) => line.trim().startsWith('|'))
      .map((line) =>
        line
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim())
      );

    if (rows.length > 0) {
      const header = rows[0];
      const dataRows = rows.slice(1).filter((r) => !r.every((c) => /^[-:\s]+$/.test(c)));

      renderedElements.push(
        <div key={`table-${index}`} className="my-3 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                {header.map((col, hIdx) => (
                  <th key={hIdx} className="px-3 py-2 font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2">
                      {renderInlineFormatting(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    tableBuffer = [];
  };

  const flushCode = (index: number) => {
    if (codeBuffer.length === 0) return;
    renderedElements.push(
      <pre key={`code-${index}`} className="my-2 p-3 bg-slate-900 text-slate-100 text-xs rounded-lg overflow-x-auto font-mono">
        <code>{codeBuffer.join('\n')}</code>
      </pre>
    );
    codeBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        flushCode(i);
        inCodeBlock = false;
      } else {
        if (tableBuffer.length > 0) flushTable(i);
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Tables
    if (line.trim().startsWith('|')) {
      tableBuffer.push(line);
      continue;
    } else if (tableBuffer.length > 0) {
      flushTable(i);
    }

    // Headers
    if (line.startsWith('### ')) {
      renderedElements.push(
        <h4 key={i} className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-3 mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          {renderInlineFormatting(line.replace('### ', ''))}
        </h4>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      renderedElements.push(
        <h3 key={i} className="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2 pb-1 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded bg-indigo-500"></span>
          {renderInlineFormatting(line.replace('## ', ''))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      renderedElements.push(
        <h2 key={i} className="text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2.5">
          {renderInlineFormatting(line.replace('# ', ''))}
        </h2>
      );
      continue;
    }

    // Bullet points
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      renderedElements.push(
        <li key={i} className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 ml-4 list-disc my-1">
          {renderInlineFormatting(line.replace(/^[\s]*[-*]\s+/, ''))}
        </li>
      );
      continue;
    }

    // Numbered lists
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      renderedElements.push(
        <div key={i} className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 ml-2 my-1.5 flex items-start gap-2">
          <span className="font-semibold text-blue-600 dark:text-blue-400 shrink-0">{numMatch[1]}.</span>
          <span>{renderInlineFormatting(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Empty lines
    if (line.trim() === '') {
      renderedElements.push(<div key={i} className="h-1.5"></div>);
      continue;
    }

    // Normal paragraph
    renderedElements.push(
      <p key={i} className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 my-1">
        {renderInlineFormatting(line)}
      </p>
    );
  }

  if (tableBuffer.length > 0) flushTable(lines.length);
  if (codeBuffer.length > 0) flushCode(lines.length);

  return <div className="space-y-0.5">{renderedElements}</div>;
};

// Formats inline **bold**, *italic*, `code`, and [หน้า X] page badges
function renderInlineFormatting(text: string): React.ReactNode {
  // Replace [หน้า X] or [Page X] with styled badge
  const pageRegex = /\[(หน้า|Page|pp\.|p\.)\s*([\d\-,และ\s]+)\]/gi;
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;

  // First pass: replace page tags
  const matches = [...text.matchAll(pageRegex)];
  if (matches.length === 0) {
    return parseMarkdownStyles(text);
  }

  matches.forEach((m, idx) => {
    const matchStart = m.index!;
    if (matchStart > lastIdx) {
      parts.push(parseMarkdownStyles(text.substring(lastIdx, matchStart)));
    }
    parts.push(
      <span
        key={`page-${idx}`}
        className="inline-flex items-center px-1.5 py-0.5 mx-1 rounded text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs"
        title="ตำแหน่งอ้างอิงในเอกสาร"
      >
        📄 {m[0].replace(/[\[\]]/g, '')}
      </span>
    );
    lastIdx = matchStart + m[0].length;
  });

  if (lastIdx < text.length) {
    parts.push(parseMarkdownStyles(text.substring(lastIdx)));
  }

  return <>{parts}</>;
}

function parseMarkdownStyles(str: string): React.ReactNode {
  // Handle `code`
  const codeParts = str.split(/(`[^`]+`)/g);
  return (
    <>
      {codeParts.map((part, pIdx) => {
        if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
          return (
            <code key={pIdx} className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400 font-mono text-[11px] rounded">
              {part.slice(1, -1)}
            </code>
          );
        }

        // Handle **bold**
        const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
        return boldParts.map((bPart, bIdx) => {
          if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length >= 4) {
            return (
              <strong key={`${pIdx}-${bIdx}`} className="font-semibold text-slate-900 dark:text-white">
                {bPart.slice(2, -2)}
              </strong>
            );
          }
          // Handle *italic*
          const italicParts = bPart.split(/(\*[^*]+\*)/g);
          return italicParts.map((iPart, iIdx) => {
            if (iPart.startsWith('*') && iPart.endsWith('*') && iPart.length >= 2) {
              return <em key={`${pIdx}-${bIdx}-${iIdx}`}>{iPart.slice(1, -1)}</em>;
            }
            return iPart;
          });
        });
      })}
    </>
  );
}
