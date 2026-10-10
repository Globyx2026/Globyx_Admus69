import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Check, Copy } from 'lucide-react';
import type { CodeSample } from '@/data/codeSamples';
import { cn } from '@/lib/utils';
import { Segmented } from './Segmented';

export interface CodeGroup {
  /** Name of the task, for example "Buy a number". */
  label: string;
  samples: CodeSample[];
}

interface CodePanelProps {
  groups: CodeGroup[];
  className?: string;
}

const KEYWORDS = new Set([
  'curl', 'import', 'from', 'const', 'let', 'await', 'async', 'return', 'print', 'new', 'true', 'false', 'null',
]);

const TOKEN =
  /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\$[A-Z_]+)|(\s-{1,2}[A-Za-z][\w-]*)|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_]\w*)\b/g;

/** Small syntax colouring, enough for cURL, Python, JavaScript and JSON. */
function highlightLine(line: string): ReactNode[] {
  const trimmed = line.trimStart();
  if (trimmed.startsWith('#') || trimmed.startsWith('//')) {
    return [
      <span key="c" className="text-cream/40">
        {line}
      </span>,
    ];
  }

  const out: ReactNode[] = [];
  let last = 0;
  TOKEN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TOKEN.exec(line))) {
    const [text, str, envVar, flag, num, word] = match;
    if (match.index > last) out.push(line.slice(last, match.index));
    let tone: string | undefined;
    if (str) tone = 'text-glow';
    else if (envVar || num) tone = 'text-success';
    else if (flag) tone = 'text-[#b9bfe6]';
    else if (word && KEYWORDS.has(word)) tone = 'text-accent-hover';
    out.push(
      tone ? (
        <span key={match.index} className={tone}>
          {text}
        </span>
      ) : (
        text
      ),
    );
    last = match.index + text.length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers and non-secure pages: fall back to a hidden textarea.
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

/** Dark code window with task and language tabs and a copy button. */
export function CodePanel({ groups, className }: CodePanelProps) {
  const [groupIndex, setGroupIndex] = useState(0);
  const [language, setLanguage] = useState(groups[0].samples[0].label);
  const [copied, setCopied] = useState(false);

  const group = groups[groupIndex];
  const sample = group.samples.find((s) => s.label === language) ?? group.samples[0];
  const lines = sample.code.split('\n');

  async function onCopy() {
    const ok = await copyText(sample.code);
    if (!ok) {
      toast.error('Could not copy', { description: 'Select the code and copy it manually.' });
      return;
    }
    setCopied(true);
    toast.success('Copied to clipboard');
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-white/10 bg-ink-2 text-cream shadow-[var(--shadow-float)]',
        className,
      )}
    >
      {groups.length > 1 && (
        <div className="border-b border-white/10 p-3">
          <Segmented
            label="Example"
            tone="dark"
            size="sm"
            value={String(groupIndex)}
            onChange={(value) => setGroupIndex(Number(value))}
            options={groups.map((g, index) => ({ value: String(index), label: g.label }))}
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-b border-white/10 pr-2 pl-1">
        <div role="tablist" aria-label="Language" className="no-scrollbar flex overflow-x-auto">
          {group.samples.map((s) => {
            const active = s.label === sample.label;
            return (
              <button
                key={s.label}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setLanguage(s.label)}
                className={cn(
                  'micro relative px-4 py-3.5 transition-colors -outline-offset-2',
                  active ? 'text-cream' : 'text-cream/45 hover:text-cream/80',
                )}
              >
                {s.label}
                {active && <span className="absolute inset-x-4 bottom-0 h-px bg-accent" />}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs text-cream/70 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-cream"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-[1.75]" role="tabpanel" tabIndex={0}>
        <code>
          {lines.map((line, index) => (
            <span key={index} className="block">
              <span className="mr-5 inline-block w-5 text-right text-cream/25 select-none" aria-hidden="true">
                {index + 1}
              </span>
              {highlightLine(line)}
              {line.length === 0 && '\u200b'}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
