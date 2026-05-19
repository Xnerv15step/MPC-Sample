<img width="2474" height="4116" alt="localhost_5173_" src="https://github.com/user-attachments/assets/01a2b277-f7e9-43ca-8cdf-f7543cf38821" />
# 🎛️ MPC Sample

> 一個運行在瀏覽器的迷你取樣機 / 節拍製作器

MPC Sample 是一個以 Web Audio API 為核心開發的瀏覽器節拍製作工具，靈感來自 AKAI MPC 系列取樣機。你可以用滑鼠或鍵盤觸發打擊墊、在 Step Sequencer 上編排節拍，最後將成品匯出成 .wav 音訊檔。

---

## ✨ 功能

### 打擊墊

- 16 個打擊墊（4×4 排列）
- 滑鼠點擊或鍵盤觸發
- 按下時有視覺反饋

### Step Sequencer

- 16 軌 × 16 步
- 點擊格子編排節拍
- 播放位置即時高亮顯示

### 控制面板

- Play / Stop
- BPM 調整（60 ~ 200）
- 音量控制
- 雙音色庫切換（Beat Kit / Band Kit）
- 匯出 .wav

---

## 🎹 鍵盤對應

- 1 2 3 4
- Q W E R
- A S D F
- Z X C V

---

## 🎧 音色庫

| Kit          | 內容                                                          |
| ------------ | ------------------------------------------------------------- |
| **Beat Kit** | 嘻哈電子風格：大鼓、小鼓、Hi-Hat、Clap、808 Bass 等 16 個音效 |
| **Band Kit** | 樂團風格：鼓組、Bass 吉他、電吉他、Lead、人聲切片等 16 個音效 |

音效來源：[Freesound.org](https://freesound.org)，授權為 Creative Commons 0（CC0）。  
音效檔已包含於專案 `public/samples/` 目錄中，可直接使用。

---

## 🛠️ 技術棧

- **Vue 3** + **Vite**
- **Web Audio API** — 音效載入、播放、即時混音
- **OfflineAudioContext** — 離線渲染，匯出 .wav

---

## 🚀 開始使用

### 環境需求

- Node.js 18+
- npm 9+

### 安裝與啟動

```sh
# 安裝依賴
npm install

# 開發模式（含 Hot Reload）
npm run dev

# 打包
npm run build
```

### 音效檔

音效檔已包含於 `public/samples/` 目錄，分為 `beat/` 和 `band/` 兩套音色庫，無需額外下載。

---

## 📖 Web Audio API 核心概念

本專案使用 Web Audio API 而非 HTML `<audio>` 標籤，主要原因：

| 功能             | `<audio>` | Web Audio API |
| ---------------- | --------- | ------------- |
| 快速連打同一音效 | ❌        | ✅            |
| 精確時間控制     | ❌        | ✅            |
| 混音後匯出       | ❌        | ✅            |
| 音量節點控制     | 有限      | ✅            |

播放流程：

- OfflineAudioContext → 依時間點排入所有音效 → startRendering() → AudioBuffer → WAV 格式轉換 → Blob → 下載

---

## 📝 License

MIT

---

## Demo

（部署後補上連結）
