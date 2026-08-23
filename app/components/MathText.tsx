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

  // If already contains standard LaTeX delimiters, return as-is
  if (input.includes('\\(') || input.includes('\\[') || input.includes('$')) {
    return input;
  }

  // Common LaTeX commands / symbols that signal math content
  const hasLatexCmd = /\\[a-zA-Z]+/.test(input);
  const hasExponent = /[a-zA-Z0-9]\^[0-9a-zA-Z{}]/.test(input);

  if (!hasLatexCmd && !hasExponent) {
    return input;
  }

  // If the entire text is a short math expression (e.g. "\frac{1}{2}" or "\sqrt{2}" or "f(x)=\ln x - \frac{x}{2}")
  // wrap the whole thing if it doesn't contain sentence punctuation
  const sentences = input.trim().split(/(?<=[.!?])\s+/);
  
  return input.replace(/((?:[a-zA-Z0-9_\(\)\[\]\{\}\+\-\*\/=,;\s]*\\[a-zA-Z]+(?:\{[^}]*\}|\s|[0-9a-zA-Z_\^\-\+\=\(\)])*)+|(?:[a-zA-Z0-9_\(\)\[\]\{\}]+\^[0-9a-zA-Z_\{\}]+))/g, (match) => {
    const trimmed = match.trim();
    if (!trimmed || trimmed.length < 2) return match;
    // Don't wrap if it's just plain English words without math symbols
    if (!/\\|\^|_|=/.test(trimmed)) return match;
    return ` \\(${trimmed}\\) `;
  });
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
