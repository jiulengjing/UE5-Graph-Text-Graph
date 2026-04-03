import { Handle, Position } from '@xyflow/react';
import { useMemo } from 'react';
import { NodeData, PinData, NIAGARA_PIN_COLORS } from '../../themes';

// ── Niagara node header colors (warm, energetic) ──
const NODE_THEME: Record<string, { h1: string; h2: string; border: string; glow: string; icon: string }> = {
  emitter:  { h1: '#7a3000', h2: '#5a2000', border: '#cc6020', glow: 'rgba(204,96,32,0.4)',   icon: '🔥' },
  particle: { h1: '#1a5a28', h2: '#104018', border: '#30a048', glow: 'rgba(48,160,72,0.3)',   icon: '◆' },
  module:   { h1: '#3a1260', h2: '#280a48', border: '#7030b0', glow: 'rgba(112,48,176,0.4)',  icon: '⬡' },
  event:    { h1: '#0d3a6b', h2: '#082850', border: '#1865c0', glow: 'rgba(24,101,192,0.35)', icon: '⚡' },
  variable: { h1: '#0a4050', h2: '#062e38', border: '#1888a8', glow: 'rgba(24,136,168,0.35)', icon: '◈' },
};

type NiagaraStage = 'spawn' | 'update' | 'render';
const STAGE_COLORS: Record<NiagaraStage, { bg: string; text: string }> = {
  spawn:  { bg: 'rgba(255,107,53,0.18)',  text: '#ff8050' },
  update: { bg: 'rgba(168,85,247,0.18)',  text: '#c070f0' },
  render: { bg: 'rgba(56,180,240,0.18)',  text: '#60ccff' },
};

// Solid right-pointing triangle for Niagara exec pins
const TRIANGLE = 'polygon(0% 0%, 100% 50%, 0% 100%)';

const LABEL: React.CSSProperties = {
  fontSize: '11px', color: '#d0b8f8', lineHeight: 1, whiteSpace: 'nowrap', userSelect: 'none',
};

function niaPinColor(pin: PinData): string {
  if (pin.type === 'exec') return '#ff8040';
  return (pin.dataType && NIAGARA_PIN_COLORS[pin.dataType]) ?? '#9e9e9e';
}

function NiaInputPin({ pin }: { pin: PinData }) {
  const c = niaPinColor(pin);
  const exec = pin.type === 'exec';
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '24px', paddingLeft: '18px' }}>
      <Handle type="target" position={Position.Left} id={pin.id} style={{
        width: exec ? '12px' : '10px', height: exec ? '12px' : '10px',
        left: exec ? '-6px' : '-5px', top: '50%', transform: 'translateY(-50%)',
        borderRadius: exec ? '0' : '50%', background: c,
        border: exec ? 'none' : `1.5px solid rgba(0,0,0,0.5)`,
        clipPath: exec ? TRIANGLE : undefined,
        boxShadow: exec ? `0 0 6px ${c}` : `0 0 4px ${c}88`,
      }} />
      {pin.label && <span style={LABEL}>{pin.label}</span>}
    </div>
  );
}

function NiaOutputPin({ pin }: { pin: PinData }) {
  const c = niaPinColor(pin);
  const exec = pin.type === 'exec';
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '24px', paddingRight: '18px' }}>
      {pin.label && <span style={LABEL}>{pin.label}</span>}
      <Handle type="source" position={Position.Right} id={pin.id} style={{
        width: exec ? '12px' : '10px', height: exec ? '12px' : '10px',
        right: exec ? '-6px' : '-5px', top: '50%', transform: 'translateY(-50%)',
        borderRadius: exec ? '0' : '50%', background: c,
        border: exec ? 'none' : `1.5px solid rgba(0,0,0,0.5)`,
        clipPath: exec ? TRIANGLE : undefined,
        boxShadow: exec ? `0 0 6px ${c}` : `0 0 4px ${c}88`,
      }} />
    </div>
  );
}

export default function NiagaraNode({ data }: { data: NodeData }) {
  const theme = useMemo(() => NODE_THEME[data.nodeType] ?? NODE_THEME.module, [data.nodeType]);
  const stage = data.meta?.stage as NiagaraStage | undefined;
  const stageStyle = stage ? STAGE_COLORS[stage] : undefined;

  const inputs  = [...data.inputs.filter(p => p.type === 'exec'),  ...data.inputs.filter(p => p.type !== 'exec')];
  const outputs = [...data.outputs.filter(p => p.type === 'exec'), ...data.outputs.filter(p => p.type !== 'exec')];
  const rows = Math.max(inputs.length, outputs.length, 1);

  return (
    <div style={{
      minWidth: '200px', borderRadius: '8px', overflow: 'visible',
      border: `1px solid ${theme.border}`,
      boxShadow: `0 0 0 1px rgba(0,0,0,0.95), 0 0 20px ${theme.glow}, 0 8px 28px rgba(0,0,0,0.85)`,
      background: '#1a1518', position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(180deg, ${theme.h1} 0%, ${theme.h2} 100%)`,
        borderRadius: '7px 7px 0 0', padding: '5px 10px',
        display: 'flex', alignItems: 'center', gap: '7px',
        borderBottom: `1px solid ${theme.border}66`, minHeight: '28px',
      }}>
        <span style={{ fontSize: '12px', opacity: 0.85, lineHeight: 1, flexShrink: 0 }}>{theme.icon}</span>
        <span style={{ flex: 1, fontSize: '12px', fontWeight: 700, color: '#fff', letterSpacing: '0.03em', lineHeight: 1, whiteSpace: 'nowrap', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{data.label}</span>
        {stageStyle && (
          <span style={{
            fontSize: '9px', fontWeight: 700, color: stageStyle.text, background: stageStyle.bg,
            border: `1px solid ${stageStyle.text}44`, borderRadius: '3px',
            padding: '1px 5px', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0,
          }}>{stage}</span>
        )}
      </div>
      {/* Pin area */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        paddingTop: '4px', paddingBottom: '5px',
        minHeight: `${rows * 24 + 9}px`,
        background: 'linear-gradient(180deg, #1e1820 0%, #18141a 100%)',
        borderRadius: '0 0 7px 7px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>{inputs.map(p => <NiaInputPin key={p.id} pin={p} />)}</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>{outputs.map(p => <NiaOutputPin key={p.id} pin={p} />)}</div>
      </div>
    </div>
  );
}
