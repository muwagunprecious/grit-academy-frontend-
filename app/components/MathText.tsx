'use client';

import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Pre-processes text to auto-wrap raw LaTeX commands (\frac, \sqrt, \ln, \pi, etc.)
 * or caret exponents (e.g. e^2, x^2) if they are missing standard delimiters \(..\) or $..$.
 */
function autoWrapLatex(input: string): string {
  if (!input) return '';

  let cleaned = input;

  // Convert raw missing backslashes in common math commands (e.g. int_0 -> \int_0, infty -> \infty, Gamma -> \Gamma, zeta -> \zeta)
  cleaned = cleaned
    .replace(/(?<!\\)\b(int_0|int_|infty|Gamma|zeta|alpha|beta|theta|lambda|sigma|omega|partial|sum_|prod_)/g, '\\$1');

  // Convert parenthesized math expressions like (int_0^{...}...) or (s=4) or (x^3) or (x) into \(...\)
  cleaned = cleaned.replace(/\(([^()\n]*?(?:\\[a-zA-Z]+|\^|_|=)[^()\n]*?)\)/g, (match, inner) => {
    const trimmed = inner.trim();
    if (/\\|\^|_|=/.test(trimmed)) {
      return ` \\(${trimmed}\\) `;
    }
    return match;
  });

  return cleaned;
}

export default function MathText({ text, className = '', style }: MathTextProps) {
  if (!text) return null;

  // Auto wrap any raw un-delimited LaTeX
  const normalizedText = autoWrapLatex(text);

  // Regex matching display math \[...\] or $$...$$, or inline math \(...\) or $...$
  const parts: { type: 'text' | 'math'; content: string; display?: boolean }[] = [];
  
  const mathRegex = /(\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|\\\(.*?\\\)|(?:\$[^$\n]+?\$))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mathRegex.exec(normalizedText)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: normalizedText.slice(lastIndex, match.index) });
    }

    const matchedStr = match[0];
    let mathContent = '';
    let display = false;

    if (matchedStr.startsWith('\\[') && matchedStr.endsWith('\\]')) {
      mathContent = matchedStr.slice(2, -2);
      display = true;
    } else if (matchedStr.startsWith('$$') && matchedStr.endsWith('$$')) {
      mathContent = matchedStr.slice(2, -2);
      display = true;
    } else if (matchedStr.startsWith('\\(') && matchedStr.endsWith('\\)')) {
      mathContent = matchedStr.slice(2, -2);
      display = false;
    } else if (matchedStr.startsWith('$') && matchedStr.endsWith('$')) {
      mathContent = matchedStr.slice(1, -1);
      display = false;
    }

    parts.push({ type: 'math', content: mathContent.trim(), display });
    lastIndex = mathRegex.lastIndex;
  }

  if (lastIndex < normalizedText.length) {
    parts.push({ type: 'text', content: normalizedText.slice(lastIndex) });
  }

  return (
    <span className={className} style={style}>
      {parts.map((part, i) => {
        if (part.type === 'text') {
          return <React.Fragment key={i}>{part.content}</React.Fragment>;
        }

        try {
          const html = katex.renderToString(part.content, {
            displayMode: part.display,
            throwOnError: false,
          });
          return (
            <span
              key={i}
              dangerouslySetInnerHTML={{ __html: html }}
              style={{
                display: part.display ? 'block' : 'inline-block',
                margin: part.display ? '8px 0' : '0 2px',
              }}
            />
          );
        } catch {
          return <code key={i}>{part.content}</code>;
        }
      })}
    </span>
  );
}
