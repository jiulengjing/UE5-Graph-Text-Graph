import { Handle, Position } from '@xyflow/react';
import { useMemo } from 'react';

export type PinType = 'exec' | 'data';

export interface PinData {
  id: string;
  label: string;
  type: PinType;
  dataType?: string;
}

export type BlueprintNodeType = 'event' | 'function' | 'macro' | 'variable';

export interface BlueprintNodeData extends Record<string, unknown> {
  bpType: BlueprintNodeType;
  label: string;
  inputs: PinData[];
  outputs: PinData[];
}

// ── UE5 node header colors ──
const NODE_THEME: Record<BlueprintNodeType, { h1: string; h2: string; border: string; icon: string }> = {
  event:    { h1: '#9c1411', h2: '#7a0d0b', border: '#b52018', icon: '⚡' },
  function: { h1: '#0d4d8f', h2: '#093c6e', border: '#1565c0', icon: 'ƒ' },
  macro:    { h1: '#484848', h2: '#363636', border: '#666',    icon: 'M'  },
  variable: { h1: '#1a6b32', h2: '#125228', border: '#239e47', icon: '◈' },
};

// ── UE5 pin data-type colors ──
const PIN_COLOR: Record<string, string> = {
  exec:      '#ffffff',
  boolean:   '#8b0000',
  integer:   '#38b4f0',
  float:     '#93c847',
  double:    '#93c847',
  string:    '#f562a0',
  text:      '#f562a0',
  name:      '#d0c040',
  vector:    '#d9a800',
  vector2d:  '#e0c050',
  rotator:   '#98b9f5',
  transform: '#f0803c',
  object:    '#1e90ff',
  class:     '#6495ed',
  byte:      '#008080',
  struct:    '#4a90d9',
};

function pinColor(pin: PinData) {
  if (pin.type === 'exec') return '#ffffff';
  return (pin.dataType && PIN_COLOR[pin.dataType]) ?? '#9e9e9e';
}

// Chevron arrow shape for exec pins (UE5 style)
const ARROW = 'polygon(0% 20%, 55% 20%, 55% 0%, 100% 50%, 55% 100%, 55% 80%, 0% 80%)';

// ── Shared label style ──
const LABEL: React.CSSProperties = {
  fontSize: '12px',
  color: '#c8c8c8',
  lineHeight: 1,
  whiteSpace: 'nowrap',
  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  userSelect: 'none',
};

function InputPin({ pin }: { pin: PinData }) {
  const c = pinColor(pin);
  const exec = pin.type === 'exec';
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '24px', paddingLeft: '18px' }}>
      <Handle
        type="target"
        position={Position.Left}
        id={pin.id}
        style={{
          width:  exec ? '14px' : '10px',
          height: exec ? '11px' : '10px',
          left:   exec ? '-7px' : '-5px',
          top: '50%', transform: 'translateY(-50%)',
          borderRadius: exec ? '0' : '50%',
          background: c,
          border: exec ? 'none' : `1.5px solid rgba(0,0,0,0.55)`,
          clipPath: exec ? ARROW : undefined,
          boxShadow: exec ? 'none' : `0 0 4px ${c}88`,
        }}
      />
      {pin.label && <span style={LABEL}>{pin.label}</span>}
    </div>
  );
}

function OutputPin({ pin }: { pin: PinData }) {
  const c = pinColor(pin);
  const exec = pin.type === 'exec';
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '24px', paddingRight: '18px' }}>
      {pin.label && <span style={LABEL}>{pin.label}</span>}
      <Handle
        type="source"
        position={Position.Right}
        id={pin.id}
        style={{
          width:  exec ? '14px' : '10px',
          height: exec ? '11px' : '10px',
          right:  exec ? '-7px' : '-5px',
          top: '50%', transform: 'translateY(-50%)',
          borderRadius: exec ? '0' : '50%',
          background: c,
          border: exec ? 'none' : `1.5px solid rgba(0,0,0,0.55)`,
          clipPath: exec ? ARROW : undefined,
          boxShadow: exec ? 'none' : `0 0 4px ${c}88`,
        }}
      />
    </div>
  );
}

export default function BlueprintNode({ data }: { data: BlueprintNodeData }) {
  const theme = useMemo(() => NODE_THEME[data.bpType] ?? NODE_THEME.function, [data.bpType]);

  // Exec pins first, then data
  const inputs  = [...data.inputs.filter(p => p.type === 'exec'),  ...data.inputs.filter(p => p.type !== 'exec')];
  const outputs = [...data.outputs.filter(p => p.type === 'exec'), ...data.outputs.filter(p => p.type !== 'exec')];
  const rows = Math.max(inputs.length, outputs.length, 1);

  return (
    <div style={{
      minWidth: '200px',
      borderRadius: '8px',
      overflow: 'visible',
      border: `1px solid ${theme.border}55`,
      boxShadow: `0 0 0 1px rgba(0,0,0,0.95), 0 8px 28px rgba(0,0,0,0.85), 0 2px 6px rgba(0,0,0,0.6)`,
      background: '#222',
      position: 'relative',
    }}>

      {/* ── Header ── */}
      <div style={{
        background: `linear-gradient(180deg, ${theme.h1} 0%, ${theme.h2} 100%)`,
        borderRadius: '7px 7px 0 0',
        padding: '5px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        borderBottom: '1px solid rgba(0,0,0,0.6)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
        minHeight: '28px',
      }}>
        <span style={{ fontSize: '12px', opacity: 0.7, lineHeight: 1, flexShrink: 0 }}>{theme.icon}</span>
        <span style={{
          fontSize: '12px', fontWeight: 700, color: '#fff',
          letterSpacing: '0.03em', lineHeight: 1,
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
          fontFamily: '"Segoe UI", system-ui, sans-serif',
          whiteSpace: 'nowrap',
        }}>{data.label}</span>
      </div>

      {/* ── Pin area ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        paddingTop: '4px',
        paddingBottom: '5px',
        minHeight: `${rows * 24 + 9}px`,
        background: 'linear-gradient(180deg, #252525 0%, #202020 100%)',
        borderRadius: '0 0 7px 7px',
      }}>
        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {inputs.map(p => <InputPin key={p.id} pin={p} />)}
        </div>
        {/* Outputs */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {outputs.map(p => <OutputPin key={p.id} pin={p} />)}
        </div>
      </div>
    </div>
  );
}
