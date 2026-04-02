# Json2Board

> 鎶?AI 澶фā鍨嬬殑 JSON 杈撳嚭鐩存帴鍙鍖栦负 UE5 椋庢牸钃濆浘鑺傜偣鍥?
**[English](./README.md)** 路 [Releases](https://github.com/jiulengjing/Json2Board/releases/latest) 路 [Issues](https://github.com/jiulengjing/Json2Board/issues)

[![Release](https://img.shields.io/badge/Release-v0.0.1-blue?style=flat-square)](https://github.com/jiulengjing/Json2Board/releases/tag/v0.0.1)
[![Platform](https://img.shields.io/badge/Platform-Windows-lightgrey?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)]()

---

## 杩欐槸浠€涔堬紵

Json2Board 鍦ㄦ祻瑙堝櫒涓妸 JSON 娓叉煋鎴愪氦浜掑紡鐨勩€佺被浼艰櫄骞诲紩鎿庤摑鍥鹃鏍肩殑鑺傜偣鍥俱€備綘鍙渶瑕佸憡璇?AI 浣犳兂瑕佷粈涔堥€昏緫锛屾妸 JSON 绮樿创杩涙潵锛岀珛鍒荤湅鍒板彲瑙嗗寲鐨勫浘琛ㄣ€備笉闇€瑕佸畨瑁呰櫄骞诲紩鎿庛€?
**鏍稿績鐗规€э細**
- 馃 **AI 浼樺厛宸ヤ綔娴?* 鈥?鍐呯疆 Prompt锛屽彂缁欎换鎰忓ぇ妯″瀷锛圙PT-4o銆丆laude銆丟emini鈥︼級锛岀洿鎺ョ矘璐寸粨鏋?- 馃搼 **澶氭爣绛鹃〉** 鈥?鍍忔祻瑙堝櫒涓€鏍峰苟鎺掓墦寮€澶氬紶钃濆浘
- 馃捑 **`.j2b` 鏂囦欢** 鈥?鑷畾涔夊懡鍚嶄繚瀛?鍔犺浇钃濆浘锛屽悕绉板唴宓屽湪 JSON 涓?- 馃寪 **HTTP API** 鈥?`POST /api/render`锛屼緵鑴氭湰鍜屾彃浠剁▼搴忓寲璋冪敤
- 鈿?**鍏嶅畨瑁?* 鈥?鍗曚竴鍙墽琛屾枃浠讹紝鏃犻渶 WebView2 / .NET / VC++ 杩愯鏃?
---

## 涓嬭浇 & 杩愯

1. 鍓嶅線 [Releases](https://github.com/jiulengjing/Json2Board/releases/latest)
2. 涓嬭浇 `Json2Board-v0.0.1-windows-x64.zip`
3. 瑙ｅ帇鍚?*鍙屽嚮 `Json2Board.exe`**鍗冲彲

绋嬪簭鍚姩鏈湴 HTTP 鏈嶅姟鍣紝骞惰嚜鍔ㄥ湪娴忚鍣ㄤ腑鎵撳紑 `http://localhost:14178`銆?
> **绯荤粺瑕佹眰锛?* Windows 10/11锛孋hrome 鎴栦换鎰忕幇浠ｆ祻瑙堝櫒  
> 鏃犻渶瀹夎锛屾棤渚濊禆椤广€?
---

## 浣跨敤鏂规硶

鎵撳紑鍚庨粯璁ゆ樉绀轰娇鐢ㄨ鏄庨〉锛岄噷闈㈡湁瀹屾暣鏁欑▼銆傚熀鏈祦绋嬶細

```
鎵撳紑搴旂敤 鈫?澶嶅埗 AI Prompt 鈫?鍙戠粰澶фā鍨?鈫?寰楀埌 JSON 鈫?绮樿创杩涘簲鐢?鈫?鐪嬪埌钃濆浘
```

1. **澶嶅埗 AI Prompt** 鈥?鐐瑰嚮涓婚〉鐨勩€屽鍒?AI Prompt銆嶆寜閽紝浣滀负绯荤粺鎻愮ず璇嶅彂缁欏ぇ妯″瀷
2. **鎻忚堪浣犵殑閫昏緫** 鈥?鍛婅瘔 AI 浣犳兂瑕佷粈涔堣摑鍥?3. **绮樿创 JSON** 鈥?鐐瑰嚮 `+` 鏂板缓鏍囩椤碉紝鐒跺悗鐐广€岀矘璐?JSON銆嶏紝鎴栦娇鐢?`Ctrl+V`
4. **淇濆瓨 / 鍒嗕韩** 鈥?涓嬭浇涓?`.j2b` 鏂囦欢锛堟湰璐ㄦ槸甯﹁嚜瀹氫箟鎵╁睍鍚嶇殑 JSON锛?
---

## HTTP API锛堢▼搴忓寲璋冪敤锛?
| 绔偣 | 鏂规硶 | 璇存槑 |
|------|------|------|
| `/api/render` | POST | 鍙戦€佽摑鍥?JSON锛屾祻瑙堝櫒鑷姩鎵撳紑骞舵覆鏌?|
| `/api/latest` | GET | 鑾峰彇鏈€鏂?payload |
| `/api/sse` | GET | SSE 瀹炴椂鎺ㄩ€佹祦 |

```bash
curl -X POST http://localhost:14178/api/render \
  -H "Content-Type: application/json" \
  -d @my_blueprint.j2b
```

---

## `.j2b` 鏂囦欢鏍煎紡

`.j2b` 鏂囦欢鏈川涓婃槸绾?JSON 鏂囦欢锛屽彧鏄墿灞曞悕涓嶅悓銆傜ず渚嬶細

```json
{
  "version": "1.0",
  "name": "鎴戠殑钃濆浘",
  "nodes": [
    {
      "id": "ev_begin",
      "type": "event",
      "label": "On Begin Play",
      "position": { "x": 100, "y": 150 },
      "inputs": [],
      "outputs": [{ "id": "exec_out", "label": "", "type": "exec" }]
    }
  ],
  "edges": []
}
```

**鑺傜偣绫诲瀷锛?* `event`锛堢孩锛?路 `function`锛堣摑锛?路 `macro`锛堢伆锛?路 `variable`锛堢豢锛?
**鏁版嵁绫诲瀷锛?* `boolean` `integer` `float` `string` `vector` `rotator` `transform` `object` 鈥?
---

## 浠庢簮鐮佹瀯寤?
```bash
git clone https://github.com/jiulengjing/Json2Board
cd Json2Board

# 1. 鏋勫缓鍓嶇
npm install
npm run build

# 2. 鏋勫缓鍚庣锛坮elease锛?cargo build --release --manifest-path src-tauri/Cargo.toml

# 杈撳嚭锛歴rc-tauri/target/release/Json2Board.exe锛堢害 2.5 MB锛岃嚜鍖呭惈锛?```

**鏋勫缓渚濊禆锛?* Node.js 18+銆丷ust stable

---

## 鎶€鏈爤

| 灞?| 鎶€鏈?|
|----|------|
| 鍚庣 | Rust + Tokio + Axum |
| 鍓嶇 | React 19 + @xyflow/react + Tailwind CSS v4 + Vite |
| 鎵撳寘 | `rust-embed` 鈥?鍓嶇缂栬瘧鍐呭祵鍒颁簩杩涘埗 |
| 鍒嗗彂 | 鍗曚竴 `.exe`锛屾棤杩愯鏃朵緷璧?|

---

## License

MIT 鈥?鍙嚜鐢变娇鐢ㄣ€佷慨鏀瑰拰鍒嗗彂銆?

