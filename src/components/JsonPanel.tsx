import { useState, useEffect, useCallback, useRef } from 'react';
import type { JsonPayload } from '../App';

interface JsonPanelProps {
  payload: JsonPayload;
  onApply: (newPayload: JsonPayload) => void;
}

export default function JsonPanel({ payload, onApply }: JsonPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync textarea when payload changes from outside (new SSE event)
  useEffect(() => {
    setText(JSON.stringify(payload, null, 2));
    setError(null);
  }, [payload]);

  const handleApply = useCallback(() => {
    try {
      const parsed = JSON.parse(text) as JsonPayload;
      setError(null);
      onApply(parsed);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [text, onApply]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to apply
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
    // Tab key = insert spaces instead of blur
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = textareaRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const val = el.value;
      setText(val.substring(0, start) + '  ' + val.substring(end));
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2;
      });
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        width: collapsed ? 'auto' : '340px',
        maxHeight: collapsed ? 'auto' : 'calc(100vh - 80px)',
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
        background: 'rgba(15, 15, 20, 0.88)',
        backdropFilter: 'blur(14px)',
        fontFamily: 'system-ui, sans-serif',
        transition: 'width 0.2s ease, max-height 0.2s ease',
      }}
    >
      {/* ─── Header toolbar ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '7px 10px',
          background: 'rgba(30, 30, 40, 0.95)',
          borderBottom: collapsed ? 'none' : '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        {/* Icon */}
        <span style={{ color: '#60a5fa', fontSize: '13px', fontWeight: 700, letterSpacing: '-0.5px', marginRight: 2 }}>
          {'{ }'}
        </span>
        {!collapsed && (
          <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', flex: 1 }}>
            JSON
          </span>
        )}

        {/* Copy button (only when expanded) */}
        {!collapsed && (
          <button
            onClick={handleCopy}
            title="Copy JSON"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
              background: copied ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.06)',
              color: copied ? '#4ade80' : '#94a3b8',
              fontSize: '11px',
              fontWeight: 500,
              transition: 'all 0.15s',
            }}
          >
            {copied ? (
              <>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                  <path d="M1 5l3 3 5-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <rect x="4" y="4" width="7" height="8" rx="1.5"/>
                  <path d="M8 4V2.5A1.5 1.5 0 006.5 1h-5A1.5 1.5 0 000 2.5v7A1.5 1.5 0 001.5 11H3"/>
                </svg>
                Copy
              </>
            )}
          </button>
        )}

        {/* Collapse / Expand toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expand panel' : 'Collapse panel'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '22px',
            height: '22px',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.06)',
            color: '#64748b',
            fontSize: '10px',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; (e.target as HTMLElement).style.color = '#cbd5e1'; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.target as HTMLElement).style.color = '#64748b'; }}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* ─── Textarea body (hidden when collapsed) ─── */}
      {!collapsed && (
        <>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => { setText(e.target.value); setError(null); }}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              color: '#c9d1d9',
              fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, monospace',
              fontSize: '11.5px',
              lineHeight: '1.65',
              padding: '10px 12px',
              overflowY: 'auto',
              minHeight: '180px',
              maxHeight: 'calc(100vh - 170px)',
              tabSize: 2,
            }}
          />

          {/* ─── Error banner ─── */}
          {error && (
            <div
              style={{
                padding: '5px 12px',
                background: 'rgba(220,38,38,0.18)',
                borderTop: '1px solid rgba(220,38,38,0.3)',
                color: '#fca5a5',
                fontSize: '10.5px',
                lineHeight: 1.4,
                flexShrink: 0,
              }}
            >
              ⚠ {error}
            </div>
          )}

          {/* ─── Footer — Apply button ─── */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              padding: '7px 10px',
              borderTop: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(18,18,28,0.7)',
              flexShrink: 0,
              gap: '8px',
            }}
          >
            <span style={{ color: '#475569', fontSize: '10px' }}>Ctrl+Enter to apply</span>
            <button
              onClick={handleApply}
              style={{
                padding: '4px 14px',
                borderRadius: '5px',
                border: '1px solid rgba(96,165,250,0.35)',
                cursor: 'pointer',
                background: 'rgba(59,130,246,0.22)',
                color: '#93c5fd',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.03em',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => {
                (e.target as HTMLElement).style.background = 'rgba(59,130,246,0.38)';
                (e.target as HTMLElement).style.borderColor = 'rgba(96,165,250,0.6)';
              }}
              onMouseLeave={e => {
                (e.target as HTMLElement).style.background = 'rgba(59,130,246,0.22)';
                (e.target as HTMLElement).style.borderColor = 'rgba(96,165,250,0.35)';
              }}
            >
              Apply
            </button>
          </div>
        </>
      )}
    </div>
  );
}
