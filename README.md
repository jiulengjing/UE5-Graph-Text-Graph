# Json2Board

> 把 AI 大模型的输出直接可视化为蓝图节点图。

![Blueprint Viewer](https://img.shields.io/badge/Blueprint-Viewer-blue?style=flat-square) ![Platform](https://img.shields.io/badge/Platform-Windows-lightgrey?style=flat-square) ![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 什么是 Json2Board？

Json2Board 是一个基于 **Tauri 2.0 + React + Rust** 的本地桌面/浏览器工具，专门用于将 JSON 数据实时渲染为类似 **Unreal Engine 蓝图** 风格的可视化节点图。

- 🤖 把 LLM 生成的 JSON 粘贴进来，立即看到蓝图效果
- 🌐 本地 HTTP 服务器，支持程序化调用
- 💾 支持 `.j2b` 文件的上传和下载
- 🔴🔵🟢 UE5 风格的节点颜色和引脚样式

---

## 快速开始

### 1. 安装依赖

```bash
# 需要 Node.js 18+, Rust (https://rustup.rs), Tauri CLI
npm install
```

### 2. 开发模式

```bash
# 启动 Vite 前端 (http://localhost:1420)
npm run dev

# 另开一个终端，启动 Tauri 后台服务
cargo run --manifest-path src-tauri/Cargo.toml
```

访问 `http://localhost:1420` 即可使用。

### 3. 构建生产版本

```bash
npm run build
cargo build --manifest-path src-tauri/Cargo.toml
```

运行 `src-tauri/target/debug/tauri-app.exe`，浏览器打开 `http://localhost:14178`。

---

## 使用方法

### 方法一：通过 AI 大模型生成（推荐）

1. 打开应用，在**主页 Tab** 点击「复制 AI Prompt」
2. 把 Prompt 粘贴给任意大模型（GPT-4o、Claude、Gemini 等）
3. 告诉 AI 你想要什么蓝图逻辑
4. 复制 AI 返回的 JSON，点击顶部「粘贴 JSON」按钮渲染

### 方法二：HTTP API（程序化调用）

```bash
# 发送蓝图数据，Chrome 自动弹出并渲染
curl -X POST http://localhost:14178/api/render \
  -H "Content-Type: application/json" \
  -d @your_file.j2b
```

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/render` | POST | 接收蓝图 JSON，Chrome 自动打开 |
| `/api/latest` | GET  | 获取最新 payload |
| `/api/sse`    | GET  | SSE 实时推送流 |

### 方法三：上传文件

点击顶部「上传 .j2b」按钮，选择本地 `.j2b` 或 `.json` 文件。

---

## .j2b 文件格式

`.j2b` 文件本质上是**纯 JSON 文件**，扩展名为 `.j2b`。完整规范见 [J2B_FORMAT.md](./J2B_FORMAT.md)。

```json
{
  "version": "1.0",
  "nodes": [
    {
      "id": "ev_begin",
      "type": "event",
      "label": "On Begin Play",
      "position": { "x": 80, "y": 200 },
      "inputs": [],
      "outputs": [{ "id": "exec_out", "label": "", "type": "exec" }]
    }
  ],
  "edges": []
}
```

**节点类型：**
- `event` → 🔴 红色 — 事件触发器
- `function` → 🔵 蓝色 — 函数/操作
- `macro` → ⚫ 灰色 — 宏/逻辑块
- `variable` → 🟢 绿色 — 变量/数据

---

## 技术栈

| 层 | 技术 |
|----|------|
| 桌面壳 | Tauri 2.0 (Rust) |
| 前端 | React 19 + TypeScript + Vite |
| 节点图 | @xyflow/react (React Flow) |
| 样式 | Tailwind CSS v4 + 内联样式 |
| HTTP 服务 | Axum (Rust) + SSE 推送 |
| 资源打包 | rust-embed（前端嵌入二进制） |

---

## 项目结构

```
Json2Board/
├── src/                    # React 前端
│   ├── App.tsx             # 主应用，标签页管理
│   └── components/
│       ├── HomeTab.tsx     # 主页（使用说明 + AI Prompt）
│       ├── BlueprintNode.tsx  # UE5 风格节点组件
│       └── JsonPanel.tsx   # 左上角 JSON 编辑面板
├── src-tauri/              # Rust 后端
│   └── src/lib.rs          # HTTP 服务器 + SSE + Chrome 打开
├── J2B_FORMAT.md           # 完整格式规范
├── LLM_PROMPT_RULES.md     # AI 提示词说明
└── test_blueprint.j2b      # 示例蓝图文件
```

---

## License

MIT
