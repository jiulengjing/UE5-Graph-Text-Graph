# Json2Board

> 鎶?AI 澶фā鍨嬬殑 JSON 杈撳嚭鐩存帴鍙鍖栦负 UE5 椋庢牸鑺傜偣鍥?鈥?钃濆浘銆佹潗璐ㄧ紪杈戝櫒銆丯iagara 涓夌鏍峰紡

**[English README](./README.md)** | [Releases](https://github.com/jiulengjing/Json2Board/releases/latest) | [Issues](https://github.com/jiulengjing/Json2Board/issues)

[![Release](https://img.shields.io/badge/Release-v0.0.2-blue?style=flat-square)](https://github.com/jiulengjing/Json2Board/releases/tag/v0.0.2)
[![Platform](https://img.shields.io/badge/Platform-Windows-lightgrey?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)]()

---

## 杩欐槸浠€涔堬紵

Json2Board 鍦ㄦ祻瑙堝櫒涓妸 JSON 娓叉煋鎴愪氦浜掑紡鐨?UE5 椋庢牸鑺傜偣鍥撅紝绮樿创 AI 鐢熸垚鐨?JSON 鍗冲埢鍙銆備笉闇€瑕佸畨瑁呰櫄骞诲紩鎿庛€?
**鏀寔鐨勫浘琛ㄦ牱寮忥紙v0.0.2锛夛細**
- 馃數 **Blueprint锛堣摑鍥撅級** 鈥?浜嬩欢/鍑芥暟/瀹?鍙橀噺鑺傜偣锛宔xec 鎵ц娴?+ 鏁版嵁寮曡剼
- 馃帹 **Material Editor锛堟潗璐ㄧ紪杈戝櫒锛?* 鈥?绾暟鎹祦锛岀汗鐞?鏁板/杈撳嚭鑺傜偣锛屽甫鍙戝厜鏁堟灉
- 鉁?**Niagara锛堢矑瀛愮壒鏁堬級** 鈥?绮掑瓙妯″潡锛屽甫 Spawn/Update/Render 闃舵寰界珷

JSON 涓竴涓?`schemaType` 瀛楁鍗冲彲鑷姩鍒囨崲娓叉煋鏍峰紡銆?
**鏍稿績鐗规€э細**
- AI 浼樺厛宸ヤ綔娴?鈥斺€?鍐呯疆涓夊 Prompt锛屾瘡绉嶆牱寮忓悇涓€濂楋紝鍙戠粰浠绘剰澶фā鍨嬪嵆鐢?- 澶氭爣绛鹃〉 鈥斺€?鍍忔祻瑙堝櫒涓€鏍峰苟鎺掓墦寮€澶氬紶鍥捐〃
- `.j2b` 鏂囦欢 鈥斺€?鑷畾涔夊懡鍚嶄繚瀛?鍔犺浇锛宻chemaType 鍐呭祵鍦?JSON 涓?- HTTP API 鈥斺€?`POST /api/render`锛屼緵鑴氭湰鍜屾彃浠剁▼搴忓寲璋冪敤
- 鍏嶅畨瑁?鈥斺€?鍗曚竴鍙墽琛屾枃浠讹紝鏃犻渶 WebView2 / .NET / VC++ 杩愯鏃?
---

## 涓嬭浇 & 杩愯

1. 鍓嶅線 [Releases](https://github.com/jiulengjing/Json2Board/releases/latest)
2. 涓嬭浇 `Json2Board-v0.0.2-windows-x64.zip`
3. 瑙ｅ帇鍚?*鍙屽嚮 `Json2Board.exe`** 鍗冲彲

绋嬪簭鍚姩鏈湴 HTTP 鏈嶅姟鍣紝骞惰嚜鍔ㄥ湪娴忚鍣ㄤ腑鎵撳紑 `http://localhost:14178`銆?
> 绯荤粺瑕佹眰锛歐indows 10/11锛孋hrome 鎴栦换鎰忕幇浠ｆ祻瑙堝櫒銆傛棤闇€瀹夎锛屾棤渚濊禆椤广€?
---

## 浣跨敤鏂规硶

鎵撳紑鍚庨粯璁ゆ樉绀轰娇鐢ㄨ鏄庨〉锛岄噷闈㈡湁瀹屾暣鏁欑▼銆傚熀鏈祦绋嬶細

```
鎵撳紑搴旂敤 -> 澶嶅埗 AI Prompt -> 鍙戠粰澶фā鍨?-> 寰楀埌 JSON -> 绮樿创杩涘簲鐢?-> 鐪嬪埌钃濆浘
```

1. **澶嶅埗 AI Prompt** -- 鐐瑰嚮涓婚〉鐨勩€屽鍒?AI Prompt銆嶆寜閽紝浣滀负绯荤粺鎻愮ず璇嶅彂缁欏ぇ妯″瀷
2. **鎻忚堪浣犵殑閫昏緫** -- 鍛婅瘔 AI 浣犳兂瑕佷粈涔堣摑鍥?3. **绮樿创 JSON** -- 鐐瑰嚮 `+` 鏂板缓鏍囩椤碉紝鐒跺悗鐐广€岀矘璐?JSON銆?4. **淇濆瓨 / 鍒嗕韩** -- 涓嬭浇涓?`.j2b` 鏂囦欢锛堢函 JSON锛岃嚜瀹氫箟鎵╁睍鍚嶏級

---

## HTTP API锛堢▼搴忓寲璋冪敤锛?
| 绔偣 | 鏂规硶 | 璇存槑 |
|------|------|------|
| `/api/render` | POST | 鍙戦€佽妭鐐瑰浘 JSON锛堜换鎰?schemaType锛夛紝娴忚鍣ㄨ嚜鍔ㄦ墦寮€骞舵覆鏌?|
| `/api/latest` | GET | 鑾峰彇鏈€鏂?payload |
| `/api/sse` | GET | SSE 瀹炴椂鎺ㄩ€佹祦 |

```bash
curl -X POST http://localhost:14178/api/render \
  -H "Content-Type: application/json" \
  -d @my_blueprint.j2b
```

---

## .j2b 鏂囦欢鏍煎紡

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

**鑺傜偣绫诲瀷锛?* `event`锛堢孩锛墊 `function`锛堣摑锛墊 `macro`锛堢伆锛墊 `variable`锛堢豢锛?
**鏁版嵁绫诲瀷锛?* `boolean` `integer` `float` `string` `vector` `rotator` `transform` `object` ...

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

鏋勫缓渚濊禆锛歂ode.js 18+銆丷ust stable

---

## 鎶€鏈爤

| 灞?| 鎶€鏈?|
|----|------|
| 鍚庣 | Rust + Tokio + Axum |
| 鍓嶇 | React 19 + @xyflow/react + Tailwind CSS v4 + Vite |
| 鎵撳寘 | rust-embed -- 鍓嶇缂栬瘧鍐呭祵鍒颁簩杩涘埗 |
| 鍒嗗彂 | 鍗曚竴 `.exe`锛屾棤杩愯鏃朵緷璧?|

---

## License

MIT -- 鍙嚜鐢变娇鐢ㄣ€佷慨鏀瑰拰鍒嗗彂銆?
