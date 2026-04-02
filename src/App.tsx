import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  Node,
  MarkerType,
  SelectionMode
} from '@xyflow/react';
import BlueprintNode, { BlueprintNodeData, PinData } from './components/BlueprintNode';
import JsonPanel from './components/JsonPanel';
import HomeTab from './components/HomeTab';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface JsonNode {
  id: string; type: string; label: string;
  position: { x: number; y: number };
  inputs: PinData[]; outputs: PinData[];
}
interface JsonEdge {
  source: string; sourceHandle: string;
  target: string; targetHandle: string;
}
export interface JsonPayload {
  version: string;
  name?: string; // Optional custom name
  nodes: JsonNode[];
  edges: JsonEdge[];
}

type TabKind = 'home' | 'board' | 'empty';
interface TabData {
  id: string; kind: TabKind; name: string; payload?: JsonPayload;
}

const nodeTypes = { blueprint: BlueprintNode };

const UE5_COLORS: Record<string, string> = {
  boolean: '#8b0000', integer: '#38b4f0', float: '#93c847', double: '#93c847',
  string: '#f562a0', text: '#f562a0', name: '#d0c040', vector: '#d9a800',
  vector2d: '#e0c050', rotator: '#98b9f5', transform: '#f0803c',
  object: '#1e90ff', class: '#6495ed', byte: '#008080',
};

// ─────────────────────────────────────────────
// Paste JSON modal
// ─────────────────────────────────────────────

function PasteModal({ onClose, onApply }: { onClose: () => void; onApply: (p: JsonPayload) => void }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const apply = () => {
    try { onApply(JSON.parse(text) as JsonPayload); onClose(); }
    catch (e) { setError((e as Error).message); }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 600, maxWidth: '90vw', background: '#1a1a2e', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 64px rgba(0,0,0,0.8)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', background: '#0f0f1a', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>📋 粘贴 JSON</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ padding: '16px 18px 18px' }}>
          <p style={{ margin: '0 0 10px', fontSize: 12, color: '#64748b' }}>粘贴符合 J2B 格式的 JSON，按 Ctrl+Enter 或点击「渲染」</p>
          <textarea autoFocus value={text} onChange={e => { setText(e.target.value); setError(''); }}
            onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') apply(); if (e.key === 'Escape') onClose(); }}
            placeholder={'{\n  "version": "1.0",\n  "nodes": [...],\n  "edges": [...]\n}'}
            spellCheck={false}
            style={{ width: '100%', height: 260, boxSizing: 'border-box', background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#c8c8c8', fontFamily: 'Consolas, monospace', fontSize: 12, lineHeight: 1.6, padding: 12, resize: 'none', outline: 'none' }} />
          {error && <div style={{ marginTop: 8, fontSize: 11, color: '#f87171', background: 'rgba(220,38,38,0.1)', padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(220,38,38,0.3)' }}>⚠ {error}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <button onClick={onClose} style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>取消</button>
            <button onClick={apply} style={{ padding: '6px 20px', borderRadius: 6, border: '1px solid #3b82f6', background: 'rgba(59,130,246,0.25)', color: '#93c5fd', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>渲染 (Ctrl+Enter)</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Empty tab — new tab page
// ─────────────────────────────────────────────

function EmptyBoard({
  onPaste, onUpload,
}: { onPaste: () => void; onUpload: () => void }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#161616', gap: 24 }}>
      {/* Dot grid bg */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.3, pointerEvents: 'none' }}>
        <defs><pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#2e2e2e" />
        </pattern></defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      <div style={{ position: 'relative', textAlign: 'center', maxWidth: 400 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #1e3a5f, #1e1e40)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: '0 8px 32px rgba(59,130,246,0.15)' }}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M5 8h16M5 13h10M5 18h7" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
            <circle cx="20" cy="16" r="5" stroke="#3b82f6" strokeWidth="1.5" fill="none" />
            <path d="M20 14v4M18 16h4" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#e2e8f0', letterSpacing: '-0.01em' }}>新建蓝图</h2>
        <p style={{ margin: '0 0 24px', fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
          粘贴 AI 生成的 JSON 文本，或上传本地 .j2b 文件开始渲染蓝图
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onPaste} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 8, border: '1px solid #3b82f6', background: 'rgba(59,130,246,0.18)', color: '#93c5fd', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.32)'; e.currentTarget.style.borderColor = '#60a5fa'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.18)'; e.currentTarget.style.borderColor = '#3b82f6'; }}>
            <span>📋</span><span>粘贴 JSON</span>
          </button>
          <button onClick={onUpload} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#e2e8f0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}>
            <span>📂</span><span>上传 .j2b</span>
          </button>
        </div>
        <p style={{ margin: '18px 0 0', fontSize: 11, color: '#334155' }}>
          在主页 Tab 可以找到 AI Prompt，发给大模型即可生成蓝图 JSON
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Board action bar (top-right floating, per board)
// ─────────────────────────────────────────────

function BoardActions({ onPaste, onUpload, onDownload }: { onPaste: () => void; onUpload: () => void; onDownload: () => void }) {
  const btns = [
    { icon: '📋', label: '粘贴', action: onPaste },
    { icon: '📂', label: '上传', action: onUpload },
    { icon: '⬇', label: '下载', action: onDownload },
  ];
  return (
    <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000, display: 'flex', gap: 4, background: 'rgba(15,15,20,0.88)', backdropFilter: 'blur(12px)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.09)', padding: '4px', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}>
      {btns.map(({ icon, label, action }) => (
        <button key={label} onClick={action} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', background: 'transparent', color: '#94a3b8', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#e2e8f0'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
          title={label}>
          <span>{icon}</span><span>{label}</span>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Board editor
// ─────────────────────────────────────────────

function BoardEditor({
  payload, onPayloadChange, onPaste, onUpload, onDownload,
}: {
  payload: JsonPayload;
  onPayloadChange: (p: JsonPayload) => void;
  onPaste: () => void; onUpload: () => void; onDownload: () => void;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<BlueprintNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    const flowNodes: Node<BlueprintNodeData>[] = payload.nodes.map(n => ({
      id: n.id, type: 'blueprint', position: n.position,
      data: { bpType: n.type as any, label: n.label, inputs: n.inputs, outputs: n.outputs },
    }));
    const flowEdges: Edge[] = payload.edges.map((e, i) => {
      const src = payload.nodes.find(n => n.id === e.source);
      const pt = src?.outputs.find(p => p.id === e.sourceHandle)?.type || 'data';
      const dt = src?.outputs.find(p => p.id === e.sourceHandle)?.dataType;
      const col = pt === 'exec' ? '#ffffff' : ((dt && UE5_COLORS[dt]) ?? '#9e9e9e');
      return {
        id: `e-${i}-${e.source}-${e.target}`,
        source: e.source, sourceHandle: e.sourceHandle,
        target: e.target, targetHandle: e.targetHandle,
        type: 'smoothstep',
        style: { stroke: col, strokeWidth: pt === 'exec' ? 2.5 : 1.8, opacity: 0.9 },
        markerEnd: pt === 'exec' ? { type: MarkerType.ArrowClosed, color: col, width: 14, height: 14 } : undefined,
      };
    });
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [payload, setNodes, setEdges]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ReactFlow nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes} fitView colorMode="dark"
        panOnDrag={[1, 2]} selectionOnDrag selectionMode={SelectionMode.Partial}
        panOnScroll={false} onContextMenu={e => e.preventDefault()}
        minZoom={0.1} maxZoom={2.5} defaultEdgeOptions={{ type: 'smoothstep' }}>
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="#2e2e2e" />
        <Controls showInteractive={false} />
      </ReactFlow>
      {/* JSON panel top-left */}
      <JsonPanel payload={payload} onApply={onPayloadChange} />
      {/* Action buttons top-right */}
      <BoardActions onPaste={onPaste} onUpload={onUpload} onDownload={onDownload} />
    </div>
  );
}

// ─────────────────────────────────────────────
// SSE badge
// ─────────────────────────────────────────────

type SSEStatus = 'connecting' | 'connected' | 'disconnected';

function StatusBadge({ status }: { status: SSEStatus }) {
  const C = {
    connecting:   { dot: '#f59e0b', text: '#fbbf24', label: 'Connecting…' },
    connected:    { dot: '#22c55e', text: '#4ade80', label: 'Live' },
    disconnected: { dot: '#ef4444', text: '#f87171', label: 'Disconnected' },
  }[status];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.dot, boxShadow: status === 'connected' ? `0 0 6px ${C.dot}` : 'none', animation: status === 'connecting' ? 'pulse 1.2s infinite' : 'none', display: 'block' }} />
      <span style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>{C.label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────

let tabCounter = 0;
const newTabId = () => `tab-${++tabCounter}-${Date.now()}`;

function App() {
  const [tabs, setTabs] = useState<TabData[]>([
    { id: 'home', kind: 'home', name: '使用说明' },
  ]);
  const [activeTabId, setActiveTabId] = useState('home');
  const [sseStatus, setSseStatus] = useState<SSEStatus>('connecting');
  const [pasteTarget, setPasteTarget] = useState<string | null>(null); // tabId that triggered paste
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileTargetRef = useRef<string | null>(null); // tabId that triggered file upload

  const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0];

  // ── create a new empty tab ──
  const addEmptyTab = useCallback(() => {
    const id = newTabId();
    setTabs(prev => [...prev, { id, kind: 'empty', name: '新建蓝图' }]);
    setActiveTabId(id);
  }, []);

  // ── turn a tab into a board ──
  const setTabPayload = useCallback((tabId: string, payload: JsonPayload, filename?: string) => {
    setTabs(prev => prev.map(t =>
      t.id === tabId
        ? { ...t, kind: 'board', payload, name: payload.name || filename || t.name }
        : t
    ));
  }, []);

  // ── update payload of active board tab (from JSON panel) ──
  const handlePayloadChange = useCallback((newPayload: JsonPayload) => {
    setTabs(prev => prev.map(t =>
      t.id === activeTabId
        ? { ...t, payload: newPayload, name: newPayload.name || t.name }
        : t
    ));
  }, [activeTabId]);

  // ── close tab ──
  const closeTab = useCallback((id: string) => {
    setTabs(prev => {
      const rest = prev.filter(t => t.id !== id);
      if (activeTabId === id) setActiveTabId(rest[rest.length - 1].id);
      return rest;
    });
  }, [activeTabId]);

  // ── paste modal handlers ──
  const openPaste = useCallback((tabId: string) => setPasteTarget(tabId), []);
  const handlePasteApply = useCallback((payload: JsonPayload) => {
    const targetId = pasteTarget ?? activeTabId;
    const tab = tabs.find(t => t.id === targetId);
    // If it's an empty/home tab, create a new board tab instead of replacing
    if (!tab || tab.kind === 'home') {
      const id = newTabId();
      setTabs(prev => [...prev, { id, kind: 'board', name: payload.name || '新建蓝图.j2b', payload }]);
      setActiveTabId(id);
    } else {
      setTabPayload(targetId, payload);
    }
    setPasteTarget(null);
  }, [pasteTarget, activeTabId, tabs, setTabPayload]);

  // ── upload handlers ──
  const openUpload = useCallback((tabId: string) => {
    fileTargetRef.current = tabId;
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const payload = JSON.parse(ev.target?.result as string) as JsonPayload;
        const tid = fileTargetRef.current ?? activeTabId;
        const tab = tabs.find(t => t.id === tid);
        const nameFromPayload = payload.name;
        if (!tab || tab.kind === 'home') {
          const id = newTabId();
          setTabs(prev => [...prev, { id, kind: 'board', name: nameFromPayload || file.name, payload }]);
          setActiveTabId(id);
        } else {
          setTabPayload(tid, payload, file.name);
        }
      } catch { alert('文件解析失败，请确认是有效的 .j2b / JSON 文件'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [activeTabId, tabs, setTabPayload]);

  // ── download ──
  const downloadTab = useCallback((tab: TabData) => {
    if (!tab.payload) return;
    const payloadToSave = { ...tab.payload, name: tab.name.replace(/\.j2b$/, '') };
    const blob = new Blob([JSON.stringify(payloadToSave, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    let baseName = tab.name;
    if (!baseName.endsWith('.j2b')) baseName += '.j2b';
    a.download = baseName;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // ── SSE ──
  useEffect(() => {
    let es: EventSource | null = null;
    let retry: ReturnType<typeof setTimeout> | null = null;
    const connect = () => {
      setSseStatus('connecting');
      es = new EventSource('/api/sse');
      es.onopen = () => setSseStatus('connected');
      es.addEventListener('update', ev => {
        setSseStatus('connected');
        try {
          const payload = JSON.parse((ev as MessageEvent).data) as JsonPayload;
          const id = newTabId();
          const tabName = payload.name || `api-${tabCounter}.j2b`;
          setTabs(prev => [...prev, { id, kind: 'board', name: tabName, payload }]);
          setActiveTabId(id);
        } catch { /* ignore */ }
      });
      es.onerror = () => { setSseStatus('disconnected'); es?.close(); retry = setTimeout(connect, 3000); };
    };
    fetch('/api/latest').then(r => r.ok ? r.json() : null).then(d => {
      if (d) {
        const id = newTabId();
        const payload = d as JsonPayload;
        setTabs(prev => [...prev, { id, kind: 'board', name: payload.name || 'latest.j2b', payload }]);
        setActiveTabId(id);
      }
    }).catch(() => {});
    connect();
    return () => { es?.close(); if (retry) clearTimeout(retry); };
  }, []); // eslint-disable-line

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#141414', fontFamily: '"Segoe UI", system-ui, sans-serif' }}>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 40, padding: '0 14px', background: '#1a1a1a', borderBottom: '1px solid #2a2a2a', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/favicon.png" style={{ width: 22, height: 22, borderRadius: 6, objectFit: 'cover' }} alt="Logo" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', letterSpacing: '-0.01em' }}>Json2Board</span>
          <span style={{ fontSize: 11, color: '#334155' }}>Blueprint Renderer</span>
        </div>

        {/* SSE status + API hint */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: '#334155', fontFamily: 'monospace', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 4, padding: '2px 7px' }}>
            POST :14178/api/render
          </span>
          <StatusBadge status={sseStatus} />
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div style={{ display: 'flex', alignItems: 'stretch', background: '#141414', borderBottom: '1px solid #2a2a2a', overflowX: 'auto', flexShrink: 0, scrollbarWidth: 'none' }}>
        {tabs.map(tab => {
          const isActive = tab.id === activeTabId;
          const isHome = tab.kind === 'home';
          return (
            <div key={tab.id} onClick={() => setActiveTabId(tab.id)}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', height: 34, cursor: 'pointer', borderRight: '1px solid #2a2a2a', flexShrink: 0, userSelect: 'none', background: isActive ? '#1e1e1e' : 'transparent', color: isActive ? '#e2e8f0' : '#64748b', fontSize: 11, fontWeight: 500, transition: 'background 0.1s, color 0.1s' }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#1a1a1a'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
              {/* Active top bar */}
              {isActive && <span style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: isHome ? '#a855f7' : tab.kind === 'empty' ? '#f59e0b' : '#3b82f6', borderRadius: '0 0 2px 2px' }} />}

              <span style={{ fontSize: 12 }}>{isHome ? '🏠' : tab.kind === 'empty' ? '✦' : '📄'}</span>
              <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab.name}</span>

              {/* Close button — only non-home tabs */}
              {!isHome && (
                <button onClick={e => { e.stopPropagation(); closeTab(tab.id); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, borderRadius: 3, border: 'none', cursor: 'pointer', background: 'transparent', color: '#475569', fontSize: '9px', marginLeft: 1, fontFamily: 'inherit' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.background = '#3a3a3a'; el.style.color = '#fff'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'transparent'; el.style.color = '#475569'; }}>
                  ✕
                </button>
              )}
            </div>
          );
        })}

        {/* ── New Tab "+" button ── */}
        <button onClick={addEmptyTab}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, flexShrink: 0, background: 'transparent', border: 'none', borderRight: '1px solid #2a2a2a', cursor: 'pointer', color: '#475569', fontSize: 16, transition: 'all 0.12s', fontFamily: 'inherit' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#1e1e1e'; e.currentTarget.style.color = '#60a5fa'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
          title="新建标签页">
          +
        </button>
      </div>

      {/* ── Content area ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {activeTab.kind === 'home' && <HomeTab />}

        {activeTab.kind === 'empty' && (
          <EmptyBoard
            onPaste={() => openPaste(activeTab.id)}
            onUpload={() => openUpload(activeTab.id)}
          />
        )}

        {activeTab.kind === 'board' && activeTab.payload && (
          <BoardEditor
            key={activeTab.id}
            payload={activeTab.payload}
            onPayloadChange={handlePayloadChange}
            onPaste={() => openPaste(activeTab.id)}
            onUpload={() => openUpload(activeTab.id)}
            onDownload={() => downloadTab(activeTab)}
          />
        )}
      </div>

      {/* ── Paste modal ── */}
      {pasteTarget !== null && (
        <PasteModal onClose={() => setPasteTarget(null)} onApply={handlePasteApply} />
      )}

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".j2b,.json" style={{ display: 'none' }} onChange={handleFileChange} />

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        button { font-family: inherit; }
      `}</style>
    </div>
  );
}

export default App;
