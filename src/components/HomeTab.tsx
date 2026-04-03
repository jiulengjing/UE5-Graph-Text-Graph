import { useState, useCallback } from 'react';

// ── AI Prompts for each schema type ──

const BLUEPRINT_PROMPT = `You are a "Blueprint Logic Translator". Your task is to translate user programming logic, Unreal Engine logic, or general workflows into a strictly formatted JSON that represents node-based visual graphs. These graphs will be rendered by Json2Board.

=== OUTPUT RULES ===
1. Output ONLY valid JSON — no markdown code fences, no extra text.
2. Always include "schemaType": "blueprint".
3. Logic flows left-to-right. Nodes connect via "exec" (flow) lines and "data" lines.
4. Assign logical x/y positions. Start events at {"x": 100, "y": 150}, space nodes 300-400px horizontally.

=== JSON SCHEMA (v1.0) ===
{
  "version": "1.0",
  "schemaType": "blueprint",
  "name": "My Blueprint Name",
  "nodes": [
    {
      "id": "unique_node_id",
      "type": "<event|function|macro|variable>",
      "label": "Display Name",
      "position": { "x": 100, "y": 150 },
      "inputs":  [ { "id": "pin_id", "label": "Name", "type": "<exec|data>", "dataType": "<see below>" } ],
      "outputs": [ { "id": "pin_id", "label": "Name", "type": "<exec|data>", "dataType": "<see below>" } ]
    }
  ],
  "edges": [
    { "source": "node_id", "sourceHandle": "output_pin_id", "target": "node_id", "targetHandle": "input_pin_id" }
  ]
}

=== NODE TYPES ===
"event"    → Red header    ⚡  Entry points, triggers (On Begin Play, On Key Press)
"function" → Blue header   ƒ   Operations, method calls (Set Position, Add, Branch)
"macro"    → Gray header   M   Reusable logic (Branch, Sequence, ForLoop)
"variable" → Green header  ◈   Data getters/setters, pure functions (no exec pins)

=== PIN TYPES ===
"exec" → White arrow,  execution flow
"data" → Colored circle, data values

=== DATA TYPES ===
"boolean" "integer" "float" "double" "string" "text" "name"
"vector" "vector2d" "rotator" "transform" "object" "class" "byte"

=== EXAMPLE ===
User: "Fire when E is pressed, check if alive, if yes call Attack"
Output:
{
  "version": "1.0",
  "schemaType": "blueprint",
  "name": "Attack Logic",
  "nodes": [
    { "id": "ev_e", "type": "event", "label": "Input Action E", "position": {"x":100,"y":200}, "inputs": [], "outputs": [{"id":"exec_pressed","label":"Pressed","type":"exec"}] },
    { "id": "var_alive", "type": "variable", "label": "Get IsAlive", "position": {"x":100,"y":360}, "inputs": [], "outputs": [{"id":"val","label":"","type":"data","dataType":"boolean"}] },
    { "id": "branch", "type": "macro", "label": "Branch", "position": {"x":500,"y":200}, "inputs": [{"id":"exec_in","label":"","type":"exec"},{"id":"cond","label":"Condition","type":"data","dataType":"boolean"}], "outputs": [{"id":"true","label":"True","type":"exec"},{"id":"false","label":"False","type":"exec"}] },
    { "id": "attack", "type": "function", "label": "Attack", "position": {"x":900,"y":200}, "inputs": [{"id":"exec_in","label":"","type":"exec"}], "outputs": [{"id":"exec_out","label":"","type":"exec"}] }
  ],
  "edges": [
    {"source":"ev_e","sourceHandle":"exec_pressed","target":"branch","targetHandle":"exec_in"},
    {"source":"var_alive","sourceHandle":"val","target":"branch","targetHandle":"cond"},
    {"source":"branch","sourceHandle":"true","target":"attack","targetHandle":"exec_in"}
  ]
}`;

const MATERIAL_PROMPT = `You are a "Material Graph Translator". Translate material/shader descriptions into J2B material format for Json2Board.

=== OUTPUT RULES ===
1. Output ONLY valid JSON — no markdown, no comments.
2. Always include "schemaType": "material".
3. No execution flow — all connections are data-only. No "exec" type pins.
4. Data flows left-to-right. Inputs/params on left, operations in center, output on right.
5. Space nodes: inputs at x:100, operations at x:400-700, output at x:1000+.

=== JSON SCHEMA ===
{
  "version": "1.0",
  "schemaType": "material",
  "name": "My Material",
  "nodes": [
    {
      "id": "unique_id",
      "type": "<input|math|texture|output|param>",
      "label": "Node Name",
      "position": { "x": 100, "y": 150 },
      "inputs":  [ { "id": "pin_id", "label": "Name", "type": "data", "dataType": "<see below>" } ],
      "outputs": [ { "id": "pin_id", "label": "Name", "type": "data", "dataType": "<see below>" } ]
    }
  ],
  "edges": [
    { "source": "node_id", "sourceHandle": "output_pin_id", "target": "node_id", "targetHandle": "input_pin_id" }
  ]
}

=== NODE TYPES ===
"input"   → Gold header   ▶  Constant values (Constant, Constant3Vector, ScalarParameter)
"math"    → Blue-grey     ∑  Math ops (Multiply, Add, Lerp, Clamp, Fresnel, Power, OneMinus)
"texture" → Purple        ⬛  Texture nodes (TextureSample, TextureCoordinate, TextureObject)
"output"  → Amber         ◉  The final Material Output node (one per graph)
"param"   → Green         P  Material parameters exposed to instances (ScalarParam, VectorParam)

=== DATA TYPES ===
"float" "float2" "float3" "float4"
"texture2d" "texturecube" "samplerstate"
"color" "uv" "normal"
"metallic" "roughness" "opacity" "emissive" "mask"

=== CONSTRAINTS ===
- ALL pin types must be "data" — never use "exec" in material graphs
- The "output" node is the root; it has NO outputs, only inputs (Base Color, Metallic, Roughness, Normal, Emissive, Opacity)
- Texture pins use diamond shape (texture2d, texturecube, samplerstate)

=== EXAMPLE ===
User: "Simple metallic material with a rust texture"
Output:
{
  "version": "1.0",
  "schemaType": "material",
  "name": "Rust Metal Material",
  "nodes": [
    { "id": "tex_rust", "type": "texture", "label": "TextureSample (Rust)", "position": {"x":100,"y":100}, "inputs": [{"id":"uv","label":"UV","type":"data","dataType":"uv"}], "outputs": [{"id":"rgb","label":"RGB","type":"data","dataType":"float3"},{"id":"alpha","label":"A","type":"data","dataType":"float"}] },
    { "id": "lerp", "type": "math", "label": "Lerp", "position": {"x":500,"y":200}, "inputs": [{"id":"a","label":"A","type":"data","dataType":"float3"},{"id":"b","label":"B","type":"data","dataType":"float3"},{"id":"alpha","label":"Alpha","type":"data","dataType":"float"}], "outputs": [{"id":"out","label":"","type":"data","dataType":"float3"}] },
    { "id": "rough", "type": "input", "label": "Roughness 0.7", "position": {"x":100,"y":320}, "inputs": [], "outputs": [{"id":"val","label":"","type":"data","dataType":"float"}] },
    { "id": "output", "type": "output", "label": "Material Output", "position": {"x":900,"y":200}, "inputs": [{"id":"base_color","label":"Base Color","type":"data","dataType":"float3"},{"id":"roughness","label":"Roughness","type":"data","dataType":"float"}], "outputs": [] }
  ],
  "edges": [
    {"source":"tex_rust","sourceHandle":"rgb","target":"lerp","targetHandle":"a"},
    {"source":"tex_rust","sourceHandle":"alpha","target":"lerp","targetHandle":"alpha"},
    {"source":"lerp","sourceHandle":"out","target":"output","targetHandle":"base_color"},
    {"source":"rough","sourceHandle":"val","target":"output","targetHandle":"roughness"}
  ]
}`;

const NIAGARA_PROMPT = `You are a "Niagara Graph Translator". Translate particle effect descriptions into J2B Niagara format for Json2Board.

=== OUTPUT RULES ===
1. Output ONLY valid JSON — no markdown, no comments.
2. Always include "schemaType": "niagara".
3. Use "meta": {"stage": "spawn"|"update"|"render"} to mark simulation phase.
4. Execution flows left-to-right through stages: spawn → update → render.
5. Space nodes: spawn phase at x:100, update at x:500, render at x:900.

=== JSON SCHEMA ===
{
  "version": "1.0",
  "schemaType": "niagara",
  "name": "My Effect",
  "nodes": [
    {
      "id": "unique_id",
      "type": "<emitter|particle|module|event|variable>",
      "label": "Module Name",
      "position": { "x": 100, "y": 150 },
      "meta": { "stage": "<spawn|update|render>" },
      "inputs":  [ { "id": "pin_id", "label": "Name", "type": "<exec|data>", "dataType": "<see below>" } ],
      "outputs": [ { "id": "pin_id", "label": "Name", "type": "<exec|data>", "dataType": "<see below>" } ]
    }
  ],
  "edges": [
    { "source": "node_id", "sourceHandle": "output_pin_id", "target": "node_id", "targetHandle": "input_pin_id" }
  ]
}

=== NODE TYPES ===
"emitter"  → Orange  🔥  Emitter-level settings (Emitter State, Spawn Rate, Emitter Lifetime)
"particle" → Green   ◆   Particle modules (Initial Location, Solve Forces, Update Age)
"module"   → Purple  ⬡   General modules (Gravity Force, Drag, Curl Noise Force)
"event"    → Blue    ⚡  Events (On Particle Spawn, On Death, GPU Collision)
"variable" → Cyan    ◈   Variable reads/writes (Get/Set Particle.Position, Particle.Velocity)

=== PIN TYPES ===
"exec" → Orange solid triangle, simulation flow
"data" → Colored circle, particle data values

=== DATA TYPES ===
"float" "vector2" "vector3" "vector4" "color" "int32" "bool" "enum" "half" "matrix"

=== STAGE GUIDE ===
"spawn"  → Runs once when particle is created (set initial position, color, velocity)
"update" → Runs every frame (apply forces, update color/size over lifetime)
"render" → Controls visual output (sprite renderer, mesh renderer settings)

=== EXAMPLE ===
User: "Fire particle with gravity and color fade"
Output:
{
  "version": "1.0",
  "schemaType": "niagara",
  "name": "Fire Effect",
  "nodes": [
    { "id": "emitter_state", "type": "emitter", "label": "Emitter State", "position": {"x":100,"y":100}, "meta": {"stage":"spawn"}, "inputs": [{"id":"exec_in","label":"","type":"exec"}], "outputs": [{"id":"exec_out","label":"","type":"exec"}] },
    { "id": "spawn_rate", "type": "emitter", "label": "Spawn Rate", "position": {"x":100,"y":200}, "meta": {"stage":"spawn"}, "inputs": [{"id":"exec_in","label":"","type":"exec"}], "outputs": [{"id":"exec_out","label":"","type":"exec"},{"id":"rate","label":"Rate","type":"data","dataType":"float"}] },
    { "id": "init_loc", "type": "particle", "label": "Initialize Particle", "position": {"x":100,"y":320}, "meta": {"stage":"spawn"}, "inputs": [{"id":"exec_in","label":"","type":"exec"}], "outputs": [{"id":"exec_out","label":"","type":"exec"}] },
    { "id": "gravity", "type": "module", "label": "Gravity Force", "position": {"x":500,"y":150}, "meta": {"stage":"update"}, "inputs": [{"id":"exec_in","label":"","type":"exec"},{"id":"strength","label":"Strength","type":"data","dataType":"float"}], "outputs": [{"id":"exec_out","label":"","type":"exec"}] },
    { "id": "color_fade", "type": "module", "label": "Color over Life", "position": {"x":500,"y":280}, "meta": {"stage":"update"}, "inputs": [{"id":"exec_in","label":"","type":"exec"},{"id":"color","label":"Color","type":"data","dataType":"color"}], "outputs": [{"id":"exec_out","label":"","type":"exec"}] },
    { "id": "renderer", "type": "particle", "label": "Sprite Renderer", "position": {"x":900,"y":200}, "meta": {"stage":"render"}, "inputs": [{"id":"exec_in","label":"","type":"exec"}], "outputs": [] }
  ],
  "edges": [
    {"source":"emitter_state","sourceHandle":"exec_out","target":"spawn_rate","targetHandle":"exec_in"},
    {"source":"spawn_rate","sourceHandle":"exec_out","target":"init_loc","targetHandle":"exec_in"},
    {"source":"gravity","sourceHandle":"exec_out","target":"color_fade","targetHandle":"exec_in"},
    {"source":"color_fade","sourceHandle":"exec_out","target":"renderer","targetHandle":"exec_in"}
  ]
}`;

// ── Schema type definitions for HomeTab display ──
const SCHEMA_TYPES = [
  {
    key: 'blueprint',
    icon: '⚡',
    accent: '#3b82f6',
    name: 'Blueprint',
    subtitle: '蓝图脚本',
    desc: '模拟 UE5 蓝图编辑器，支持事件、函数、宏、变量节点，exec 执行流 + 数据引脚',
    tags: ['event', 'function', 'macro', 'variable'],
    tagColor: '#3b82f6',
    prompt: BLUEPRINT_PROMPT,
  },
  {
    key: 'material',
    icon: '🎨',
    accent: '#c084fc',
    name: 'Material Editor',
    subtitle: '材质编辑器',
    desc: '模拟 UE5 材质编辑器，纯数据流，无执行引脚，支持纹理、数学运算、材质输出节点',
    tags: ['input', 'math', 'texture', 'output', 'param'],
    tagColor: '#c084fc',
    prompt: MATERIAL_PROMPT,
  },
  {
    key: 'niagara',
    icon: '✨',
    accent: '#f97316',
    name: 'Niagara',
    subtitle: '粒子特效',
    desc: '模拟 UE5 Niagara 粒子系统，支持 Spawn/Update/Render 阶段标签，橙色三角 exec 引脚',
    tags: ['emitter', 'particle', 'module', 'event', 'variable'],
    tagColor: '#f97316',
    prompt: NIAGARA_PROMPT,
  },
];

// ── Helper components ──
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '28px' }}>
      <h2 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 700, color: '#60a5fa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Tag({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: color + '22', border: `1px solid ${color}55`, color, fontSize: '11px', fontWeight: 600, marginRight: '6px', marginBottom: '4px' }}>
      {label}
    </span>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'flex-start' }}>
      <span style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff' }}>{n}</span>
      <span style={{ fontSize: '13px', color: '#c8c8c8', lineHeight: 1.6 }}>{text}</span>
    </div>
  );
}

function CodeLine({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#111', borderRadius: '6px', border: '1px solid #2a2a2a', padding: '8px 12px', marginBottom: '8px' }}>
      <code style={{ flex: 1, fontFamily: 'Consolas, "Cascadia Code", monospace', fontSize: '12px', color: '#93c5fd' }}>{code}</code>
      <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        style={{ flexShrink: 0, padding: '2px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: copied ? '#065f46' : '#1e3a5f', color: copied ? '#4ade80' : '#93c5fd', fontSize: '10px', fontWeight: 600, transition: 'all 0.15s' }}>
        {copied ? '✓' : 'Copy'}
      </button>
    </div>
  );
}

// ── Schema type card (grid row) ──
function SchemaCard({ schema, isSelected, onSelect }: {
  schema: typeof SCHEMA_TYPES[0];
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div onClick={onSelect} style={{
      padding: '14px 16px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.18s',
      background: isSelected ? schema.accent + '18' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${isSelected ? schema.accent + '66' : 'rgba(255,255,255,0.08)'}`,
      boxShadow: isSelected ? `0 0 0 1px ${schema.accent}33, 0 4px 16px ${schema.accent}15` : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <span style={{ fontSize: '18px', lineHeight: 1 }}>{schema.icon}</span>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? schema.accent : '#e2e8f0' }}>{schema.name}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>{schema.subtitle}</div>
        </div>
        {isSelected && (
          <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 700, color: schema.accent, background: schema.accent + '22', border: `1px solid ${schema.accent}44`, borderRadius: '4px', padding: '2px 8px' }}>选中</span>
        )}
      </div>
      <p style={{ margin: 0, fontSize: '12px', color: '#8b949e', lineHeight: 1.55 }}>{schema.desc}</p>
      <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '0' }}>
        {schema.tags.map(t => <Tag key={t} color={schema.accent} label={t} />)}
      </div>
    </div>
  );
}

// ── Prompt panel ──
function PromptPanel({ schema }: { schema: typeof SCHEMA_TYPES[0] }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(schema.prompt).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  }, [schema.prompt]);

  return (
    <div style={{ background: '#0d1117', borderRadius: '10px', border: '1px solid #30363d', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#161b22', borderBottom: '1px solid #30363d' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#8b949e', fontFamily: 'monospace' }}>{schema.key}_prompt.txt</span>
          <span style={{ fontSize: '10px', color: schema.accent, background: schema.accent + '18', border: `1px solid ${schema.accent}44`, borderRadius: '3px', padding: '1px 7px', fontWeight: 600 }}>{schema.name}</span>
        </div>
        <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 14px', borderRadius: '6px', border: '1px solid', cursor: 'pointer', fontWeight: 600, fontSize: '11px', transition: 'all 0.15s', background: copied ? 'rgba(21,128,61,0.2)' : schema.accent + '25', borderColor: copied ? '#15803d' : schema.accent, color: copied ? '#4ade80' : schema.accent }}>
          {copied ? '✓ 已复制！' : '📋 复制 AI Prompt'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '16px', fontSize: '11px', fontFamily: 'Consolas, monospace', color: '#8b949e', lineHeight: 1.6, overflowX: 'auto', maxHeight: '320px', overflowY: 'auto' }}>
        {schema.prompt}
      </pre>
    </div>
  );
}

// ─────────────────────────────────────────────
// HomeTab
// ─────────────────────────────────────────────

export default function HomeTab() {
  const [selectedSchema, setSelectedSchema] = useState(0); // index into SCHEMA_TYPES

  return (
    <div style={{ width: '100%', height: '100%', overflowY: 'auto', background: '#161616', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '820px', width: '100%', padding: '40px 32px 80px', boxSizing: 'border-box', userSelect: 'text' }}>

        {/* Hero */}
        <div style={{ marginBottom: '36px', borderBottom: '1px solid #2a2a2a', paddingBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(59,130,246,0.4)' }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect width="22" height="22" rx="6" fill="transparent"/>
                <path d="M6 11h10M11 6v10" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>Json2Board</h1>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Visual Node Graph Renderer · v1.1</div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', lineHeight: 1.7 }}>
            把 AI 大模型的输出直接渲染为节点图。支持 <strong style={{ color: '#60a5fa' }}>蓝图</strong>、<strong style={{ color: '#c084fc' }}>材质编辑器</strong>、<strong style={{ color: '#f97316' }}>Niagara 粒子</strong> 三种 UE5 可视化样式，一个 <code style={{ background: '#1e293b', color: '#f0803c', padding: '1px 5px', borderRadius: 3 }}>schemaType</code> 字段自动切换。
          </p>
        </div>

        {/* Quick Start */}
        <Section title="🚀 快速开始">
          <Step n={1} text="选择下方的样式类型（Blueprint / Material / Niagara），点击「复制 AI Prompt」" />
          <Step n={2} text="将 Prompt 作为系统提示词发给任意大模型（GPT-4o、Claude、Gemini 等）" />
          <Step n={3} text="描述你想要的图表逻辑，AI 会返回带 schemaType 字段的 JSON" />
          <Step n={4} text="点击「+」新建标签页 → 「粘贴 JSON」即可看到对应样式的节点图" />
        </Section>

        {/* Schema Types + Prompt Selector */}
        <Section title="🎨 样式类型 & AI Prompt">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {SCHEMA_TYPES.map((s, idx) => (
              <SchemaCard key={s.key} schema={s} isSelected={selectedSchema === idx} onSelect={() => setSelectedSchema(idx)} />
            ))}
          </div>
          <PromptPanel schema={SCHEMA_TYPES[selectedSchema]} />
        </Section>

        {/* schemaType field explainer */}
        <Section title="🔑 schemaType 字段">
          <div style={{ background: '#1e293b', borderRadius: '8px', padding: '14px 16px', border: '1px solid #334155', fontSize: '13px', color: '#94a3b8', lineHeight: 1.7 }}>
            <p style={{ margin: '0 0 10px' }}>在 JSON 顶层添加 <code style={{ color: '#f0803c', background: '#0f172a', padding: '1px 5px', borderRadius: 3 }}>schemaType</code> 字段即可切换渲染样式：</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {SCHEMA_TYPES.map(s => (
                <div key={s.key} style={{ background: s.accent + '12', border: `1px solid ${s.accent}33`, borderRadius: '6px', padding: '8px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>{s.icon}</div>
                  <code style={{ fontSize: '11px', color: s.accent, fontFamily: 'monospace' }}>"{s.key}"</code>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px' }}>{s.name}</div>
                </div>
              ))}
            </div>
            <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#475569' }}>
              省略 schemaType 时默认为 <code style={{ color: '#60a5fa' }}>"blueprint"</code>，已有 .j2b 文件无需修改（完全向后兼容）。
            </p>
          </div>
        </Section>

        {/* HTTP API */}
        <Section title="🌐 HTTP API（程序化调用）">
          <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#94a3b8' }}>通过 HTTP POST 推送任意类型的节点图数据：</p>
          <CodeLine code="POST  http://localhost:14178/api/render" />
          <CodeLine code='Content-Type: application/json' />
          <CodeLine code="GET   http://localhost:14178/api/latest   # 获取最新 payload" />
          <CodeLine code="GET   http://localhost:14178/api/sse      # SSE 实时推送流" />
        </Section>

        {/* File format */}
        <Section title="📄 .j2b 文件格式">
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: 1.7, background: '#1e293b', borderRadius: '8px', padding: '12px 16px', border: '1px solid #334155' }}>
            <strong style={{ color: '#60a5fa' }}>.j2b</strong> 文件是<strong style={{ color: '#f1f5f9' }}>纯 JSON 文件</strong>，仅扩展名不同。
            支持的 schemaType：<code style={{ color: '#60a5fa', background: '#0f172a', padding: '1px 5px', borderRadius: 3 }}>blueprint</code> · <code style={{ color: '#c084fc', background: '#0f172a', padding: '1px 5px', borderRadius: 3 }}>material</code> · <code style={{ color: '#f97316', background: '#0f172a', padding: '1px 5px', borderRadius: 3 }}>niagara</code>。
            完整规范见项目根目录的 <code style={{ color: '#60a5fa' }}>J2B_FORMAT.md</code>。
          </p>
        </Section>

      </div>
    </div>
  );
}
