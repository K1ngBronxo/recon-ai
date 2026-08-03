import { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

marked.setOptions({ breaks: true, gfm: true });

export function renderMarkdown(md: string): string {
  const raw = marked.parse(md, { async: false }) as string;
  return DOMPurify.sanitize(raw);
}

export function Markdown({ md, className }: { md: string; className?: string }) {
  const html = useMemo(() => renderMarkdown(md), [md]);
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
