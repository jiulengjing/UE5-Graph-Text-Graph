import { Handle, Position } from '@xyflow/react';
import { useMemo } from 'react';
import { NodeData, PinData, MATERIAL_PIN_COLORS } from '../../themes';

// ── UE5 Material Editor node header colors ──
const NODE_THEME: Record<string, { h1: string; h2: string; border: string; glow: string; icon: string }> = {
  input:   { h1: '#6b4e10', h2: '#4e3800', border: '#a07228', glow: 'rgba(160,114,40,0.3)',  icon: '▶' },
  math:    { h1: '#1a2540', h2: '#101828', border: '#2a3a60', glow: 'rgba(42,58,96,0.4)',    icon: '∑' },
  texture: { h1: '#301455', h2: '#200c3e', border: '#6030a0', glow: 'rgba(96,48,160,0.35)', icon: '⬛' },
  output:  { h1: '#5a3000', h2: '#3a1e00', border: '#9a5a00', glow: 'rgba(154,90,0,0.35)',  icon: '◉' },
  param:   { h1: '#1a4a2a', h2: '#102e1a', border: '#2a7a44', glow: 'rgba(42,122,68,0.3)',  icon: 'P' },
};

// Diamond shape for texture/sampler pins
const DIAMOND = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';

const LABEL: React.CSSProperties = {
  fontSize: '11px', color: '#b8b8c8', lineHeight: 1, whiteSpace: 'nowrap', userSelect: 'none',
};

function matPinColor(pin: PinData): string {
  return (pin.dataType && MATERIAL_PIN_COLORS[pin.dataType]) ?? '#9e9e9e';
}

function MatInputPin({ pin }: { pin: PinData }) {
  const c = matPinColor(pin);
  const isTexture = pin.dataType?.startsWith('texture') || pin.dataType === 'samplerstate';
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '22px', paddingLeft: '16px' }}>
      <Handle type="target" position={Position.Left} id={pin.id} style={{
        width: '10px', height: '10px', left: '-5px', top: '50%', transform: 'translateY(-50%)',
        borderRadius: isTexture ? '0' : '50%',
        background: c, border: `1.5px solid rgba(0,0,0,0.5)`,
        clipPath: isTexture ? DIAMOND : undefined,
        boxShadow: `0 0 5px ${c}99`,
      }} />
      {pin.label && <span style={LABEL}>{pin.label}</span>}
    </div>
  );
}

function MatOutputPin({ pin }: { pin: PinData }) {
  const c = matPinColor(pin);
  const isTexture = pin.dataType?.startsWith('texture') || pin.dataType === 'samplerstate';
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '22px', paddingRight: '16px' }}>
      {pin.label && <span style={LABEL}>{pin.label}</span>}
      <Handle type="source" position={Position.Right} id={pin.id} style={{
        width: '10px', height: '10px', right: '-5px', top: '50%', transform: 'translateY(-50%)',
        borderRadius: isTexture ? '0' : '50%',
        background: c, border: `1.5px solid rgba(0,0,0,0.5)`,
        clipPath: isTexture ? DIAMOND : undefined,
        boxShadow: `0 0 5px ${c}99`,
      }} />
    </div>
  );
}

export default function MaterialNode({ data }: { data: NodeData }) {
  const theme = useMemo(() => NODE_THEME[data.nodeType] ?? NODE_THEME.math, [data.nodeType]);
  const rows = Math.max(data.inputs.length, data.outputs.length, 1);

  return (
    <div style={{
      minWidth: '220px', borderRadius: '6px', overflow: 'visible',
      border: `1px solid ${theme.border}`,
      boxShadow: `0 0 0 1px rgba(0,0,0,0.9), 0 0 16px ${theme.glow}, 0 8px 24px rgba(0,0,0,0.8)`,
      background: '#1a1a22', position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(180deg, ${theme.h1} 0%, ${theme.h2} 100%)`,
        borderRadius: '5px 5px 0 0', padding: '6px 12px',
        display: 'flex', alignItems: 'center', gap: '8px',
        borderBottom: `1px solid ${theme.border}88`, minHeight: '30px',
      }}>
        <span style={{ fontSize: '11px', opacity: 0.85, lineHeight: 1, flexShrink: 0, fontFamily: 'monospace' }}>{theme.icon}</span>
        <span style={{ flex: 1, fontSize: '12px', fontWeight: 600, color: '#e8e0f8', letterSpacing: '0.02em', lineHeight: 1, whiteSpace: 'nowrap', fontFamily: '"Segoe UI", system-ui, sans-serif' }}>{data.label}</span>
        <span style={{ fontSize: '9px', color: theme.border, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em', userSelect: 'none' }}>{data.nodeType}</span>
      </div>
      {/* Pin area */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        paddingTop: '6px', paddingBottom: '6px',
        minHeight: `${rows * 22 + 12}px`,
        background: 'linear-gradient(180deg, #1e1e2a 0%, #18181e 100%)',
        borderRadius: '0 0 5px 5px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>{data.inputs.map(p => <MatInputPin key={p.id} pin={p} />)}</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>{data.outputs.map(p => <MatOutputPin key={p.id} pin={p} />)}</div>
      </div>
    </div>
  );
}
