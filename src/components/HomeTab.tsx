import { useState, useCallback } from 'react';

// ── The complete LLM system prompt (embedded so it's always up-to-date) ──
const LLM_PROMPT = `You are a "Blueprint Logic Translator". Your task is to translate user programming logic, Unreal Engine logic, or general workflows into a strictly formatted JSON that represents node-based visual graphs. These graphs will be rendered by Json2Board.

=== OUTPUT RULES ===
1. Output ONLY valid JSON — no markdown code fences, no extra text.
2. Logic flows left-to-right. Nodes connect via "exec" (flow) lines and "data" lines.
3. Assign logical x/y positions. Start events at {"x": 100, "y": 150}, space nodes 300-400px horizontally, 150-200px vertically for branches.

=== JSON SCHEMA (v1.0) ===
{
  "version": "1.0",
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
"exec" → White arrow,  execution flow (the "then" connection)
"data" → Colored circle, data values

=== DATA TYPES (for "data" pins) ===
"boolean" "integer" "float" "double" "string" "text" "name"
"vector" "vector2d" "rotator" "transform" "object" "class" "byte"

=== CONSTRAINTS ===
- exec pins connect ONLY to exec pins; data pins ONLY to data pins
- sourceHandle must be in the source node's "outputs" array
- targetHandle must be in the target node's "inputs" array
- All node IDs must be unique; all pin IDs unique within their node
- version must be "1.0"

=== EXAMPLE ===
User: "Fire when E is pressed, check if alive, if yes call Attack"
Output:
{
  "version": "1.0",
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

// ── Small helper components ──
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

export default function HomeTab() {
  const [promptCopied, setPromptCopied] = useState(false);

  const copyPrompt = useCallback(() => {
    navigator.clipboard.writeText(LLM_PROMPT).then(() => {
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    });
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', overflowY: 'auto', background: '#161616', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '780px', width: '100%', padding: '40px 32px 80px', boxSizing: 'border-box', userSelect: 'text' }}>

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
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Blueprint Renderer · v1.0</div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', lineHeight: 1.7 }}>
            把任意 AI 大模型的输出直接可视化为蓝图节点图。只需把下面的 Prompt 发给 AI，AI 就能生成可渲染的 JSON，粘贴进来即可看到效果。
          </p>
        </div>

        {/* Quick Start Steps */}
        <Section title="🚀 快速开始">
          <Step n={1} text="点击下方「复制 AI Prompt」，把它作为系统提示词发给任意大模型（GPT-4o、Claude、Gemini 等）" />
          <Step n={2} text="告诉 AI 你想要什么蓝图逻辑，AI 会返回符合规范的 JSON 文本" />
          <Step n={3} text="点击顶部工具栏的「粘贴 JSON」按钮，或用 Ctrl+V 快速粘贴，即可看到渲染结果" />
          <Step n={4} text="也可以上传本地 .j2b 文件，或将当前蓝图下载为 .j2b 文件保存" />
        </Section>

        {/* LLM Prompt */}
        <Section title="🤖 AI Prompt — 复制发给大模型">
          <div style={{ background: '#0d1117', borderRadius: '10px', border: '1px solid #30363d', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#161b22', borderBottom: '1px solid #30363d' }}>
              <span style={{ fontSize: '11px', color: '#8b949e', fontFamily: 'monospace' }}>system_prompt.txt</span>
              <button onClick={copyPrompt} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 14px', borderRadius: '6px', border: '1px solid', cursor: 'pointer', fontWeight: 600, fontSize: '11px', transition: 'all 0.15s', background: promptCopied ? 'rgba(21,128,61,0.2)' : 'rgba(59,130,246,0.15)', borderColor: promptCopied ? '#15803d' : '#3b82f6', color: promptCopied ? '#4ade80' : '#60a5fa' }}>
                {promptCopied ? '✓ 已复制！' : '📋 复制 AI Prompt'}
              </button>
            </div>
            <pre style={{ margin: 0, padding: '16px', fontSize: '11px', fontFamily: 'Consolas, monospace', color: '#8b949e', lineHeight: 1.6, overflowX: 'auto', maxHeight: '280px', overflowY: 'auto' }}>
              {LLM_PROMPT}
            </pre>
          </div>
        </Section>

        {/* Node Types */}
        <Section title="📦 节点类型">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { color: '#b52018', icon: '⚡', type: 'event', name: '事件节点', desc: '触发器、入口点 (On Begin Play、按键事件)' },
              { color: '#1565c0', icon: 'ƒ',  type: 'function', name: '函数节点', desc: '逻辑操作、方法调用 (Branch、Set Position)' },
              { color: '#666',    icon: 'M',  type: 'macro',  name: '宏节点',   desc: '复用逻辑块 (Branch、ForLoop、Sequence)' },
              { color: '#239e47', icon: '◈',  type: 'variable', name: '变量节点', desc: '数据取/存、纯函数 (无 exec 引脚)' },
            ].map(({ color, icon, type, name, desc }) => (
              <div key={type} style={{ padding: '10px 12px', borderRadius: '8px', background: color + '14', border: `1px solid ${color}33`, display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '16px', lineHeight: 1 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color, marginBottom: '3px' }}>{name} <code style={{ fontWeight: 400, opacity: 0.7 }}>"{type}"</code></div>
                  <div style={{ fontSize: '11px', color: '#8b949e', lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Pin dataTypes */}
        <Section title="🔌 数据引脚类型 (dataType)">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            <Tag color="#8b0000" label="boolean" />
            <Tag color="#38b4f0" label="integer" />
            <Tag color="#93c847" label="float / double" />
            <Tag color="#f562a0" label="string / text" />
            <Tag color="#d0c040" label="name" />
            <Tag color="#d9a800" label="vector" />
            <Tag color="#e0c050" label="vector2d" />
            <Tag color="#98b9f5" label="rotator" />
            <Tag color="#f0803c" label="transform" />
            <Tag color="#1e90ff" label="object" />
            <Tag color="#6495ed" label="class" />
            <Tag color="#008080" label="byte" />
          </div>
          <p style={{ margin: '10px 0 0', fontSize: '11px', color: '#475569' }}>自定义 dataType 字符串也可以，显示为灰色圆点。</p>
        </Section>

        {/* HTTP API */}
        <Section title="🌐 HTTP API（程序化调用）">
          <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#94a3b8' }}>也可以通过 HTTP POST 直接推送蓝图数据（适合脚本、插件集成）：</p>
          <CodeLine code="POST  http://localhost:14178/api/render" />
          <CodeLine code='Content-Type: application/json' />
          <CodeLine code="GET   http://localhost:14178/api/latest   # 获取最新 payload" />
          <CodeLine code="GET   http://localhost:14178/api/sse      # SSE 实时推送流" />
        </Section>

        {/* File format note */}
        <Section title="📄 .j2b 文件格式">
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: 1.7, background: '#1e293b', borderRadius: '8px', padding: '12px 16px', border: '1px solid #334155' }}>
            <strong style={{ color: '#60a5fa' }}>.j2b</strong> 文件本质上是 <strong style={{ color: '#f1f5f9' }}>纯 JSON 文件</strong>，只是扩展名改为 <code style={{ color: '#f0803c', background: '#0f172a', padding: '1px 5px', borderRadius: '3px' }}>.j2b</code>。
            可以用任何文本编辑器打开和编辑。完整规范见项目根目录的 <code style={{ color: '#60a5fa' }}>J2B_FORMAT.md</code>。
          </p>
        </Section>

      </div>
    </div>
  );
}
