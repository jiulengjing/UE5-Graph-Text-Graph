# J2B File Format Specification
**Version 1.0 — Json2Board Visual Blueprint Renderer**

---

## What is a .j2b file?

A `.j2b` file is a **JSON-based blueprint definition** used by the **Json2Board** desktop application to render a visual node graph (similar to Unreal Engine Blueprints). You send it via HTTP POST to the local server, and the app renders it as an interactive node canvas.

The file extension `.j2b` stands for **Json to Board**. The contents are plain JSON — simply save with the `.j2b` extension.

---

## How to Use

Send the content of a `.j2b` file to the Json2Board HTTP server:

```
POST http://localhost:3030/update
Content-Type: application/json

{ ...j2b content... }
```

The board will update in real time.

---

## Schema Reference

```json
{
  "version": "1.0",
  "nodes": [ ...Node[] ],
  "edges": [ ...Edge[] ]
}
```

### Top-level Fields

| Field     | Type     | Required | Description                          |
|-----------|----------|----------|--------------------------------------|
| `version` | `string` | ✅       | Format version. Always use `"1.0"`.  |
| `name`    | `string` | ❌       | Optional name for the blueprint.     |
| `nodes`   | `Node[]` | ✅       | Array of nodes to render.            |
| `edges`   | `Edge[]` | ✅       | Array of connections between nodes.  |

---

### Node Object

```json
{
  "id": "node_unique_id",
  "type": "event",
  "label": "On Begin Play",
  "position": { "x": 100, "y": 200 },
  "inputs": [ ...PinData[] ],
  "outputs": [ ...PinData[] ]
}
```

| Field      | Type       | Required | Description |
|------------|------------|----------|-------------|
| `id`       | `string`   | ✅       | Unique identifier for this node. Referenced by edges. Use `snake_case` or `kebab-case`. |
| `type`     | `NodeType` | ✅       | Visual style of the node header. See **Node Types** below. |
| `label`    | `string`   | ✅       | Display name shown in the node header. |
| `position` | `{x, y}`   | ✅       | Canvas position in pixels. X grows rightward, Y grows downward. Recommend spacing nodes ~300px apart horizontally. |
| `inputs`   | `Pin[]`    | ✅       | Left-side pins (incoming connections). Can be empty `[]`. |
| `outputs`  | `Pin[]`    | ✅       | Right-side pins (outgoing connections). Can be empty `[]`. |

#### Node Types

| Value       | Color  | Icon | Use for |
|-------------|--------|------|---------|
| `"event"`    | Red    | ⚡   | Entry points, triggers, events (e.g. "On Begin Play", "On Key Press") |
| `"function"` | Blue   | ƒ    | Operations, method calls, computations (e.g. "Set Position", "Add") |
| `"macro"`    | Gray   | M    | Reusable logic blocks, utilities |
| `"variable"` | Green  | ◈    | Data getters/setters, constants |

---

### Pin Object

```json
{
  "id": "exec_out",
  "label": "Completed",
  "type": "exec",
  "dataType": "vector"
}
```

| Field      | Type       | Required | Description |
|------------|------------|----------|-------------|
| `id`       | `string`   | ✅       | Unique within the node. Referenced by edges as `sourceHandle` / `targetHandle`. |
| `label`    | `string`   | ✅       | Display text next to the pin. Use `""` for unlabeled exec pins. |
| `type`     | `PinType`  | ✅       | Either `"exec"` or `"data"`. |
| `dataType` | `string`   | ❌       | Only for `"data"` pins. Controls pin color. See **Data Types** below. |

#### Pin Types

| Value    | Shape   | Wire style | Use for |
|----------|---------|------------|---------|
| `"exec"` | Square  | Thick white step-line with arrow | Execution flow — the "then" connection |
| `"data"` | Circle  | Thin colored smooth curve | Data values passed between nodes |

#### Data Types (for `"data"` pins)

| `dataType` value | Pin Color | Use for |
|------------------|-----------|---------|
| `"vector"`       | Yellow    | 3D vectors, positions, directions |
| `"boolean"`      | Red       | True/false values |
| *(omitted)*      | Gray      | Generic / any type |

> You can add custom `dataType` strings — they will render as gray pins. Only `"vector"` and `"boolean"` have special colors.

---

### Edge Object

```json
{
  "source": "node_a",
  "sourceHandle": "exec_out",
  "target": "node_b",
  "targetHandle": "exec_in"
}
```

| Field          | Type     | Required | Description |
|----------------|----------|----------|-------------|
| `source`       | `string` | ✅       | `id` of the source node. |
| `sourceHandle` | `string` | ✅       | `id` of the output pin on the source node. |
| `target`       | `string` | ✅       | `id` of the target node. |
| `targetHandle` | `string` | ✅       | `id` of the input pin on the target node. |

**Rules:**
- `exec` outputs connect to `exec` inputs only.
- `data` outputs connect to `data` inputs only.
- An output pin can connect to multiple targets.
- A target pin can only receive one connection.

---

## Layout Recommendations

- Start events at `x: 100, y: 100`
- Space nodes **300–400px horizontally**, **150–200px vertically** for branches
- Flows read left-to-right (source nodes on the left, result nodes on the right)
- Parallel branches: offset Y by ~200px per branch

---

## Complete Example

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
      "outputs": [
        { "id": "exec_out", "label": "", "type": "exec" }
      ]
    },
    {
      "id": "fn_set_pos",
      "type": "function",
      "label": "Set Actor Location",
      "position": { "x": 420, "y": 200 },
      "inputs": [
        { "id": "exec_in",   "label": "",           "type": "exec" },
        { "id": "location",  "label": "Location",   "type": "data", "dataType": "vector" },
        { "id": "sweep",     "label": "Sweep",      "type": "data", "dataType": "boolean" }
      ],
      "outputs": [
        { "id": "exec_done", "label": "Done",       "type": "exec" }
      ]
    },
    {
      "id": "var_spawn",
      "type": "variable",
      "label": "Spawn Point",
      "position": { "x": 80, "y": 380 },
      "inputs": [],
      "outputs": [
        { "id": "val", "label": "Value", "type": "data", "dataType": "vector" }
      ]
    }
  ],
  "edges": [
    {
      "source": "ev_begin",
      "sourceHandle": "exec_out",
      "target": "fn_set_pos",
      "targetHandle": "exec_in"
    },
    {
      "source": "var_spawn",
      "sourceHandle": "val",
      "target": "fn_set_pos",
      "targetHandle": "location"
    }
  ]
}
```

---

## Quick Checklist for LLMs

Before generating a `.j2b` file, verify:

- [ ] Every `node.id` is **unique** across the entire file
- [ ] Every `pin.id` is **unique within its node** (inputs + outputs combined)
- [ ] Every edge references a **valid node `id`** in `source` / `target`
- [ ] Every edge references a **valid pin `id`** in `sourceHandle` / `targetHandle`
- [ ] `exec` pins only connect to `exec` pins; `data` pins only to `data` pins
- [ ] `version` is set to `"1.0"`
- [ ] `nodes` and `edges` are arrays (even if empty)
- [ ] Positions are spread out (not all stacked at `0,0`)
