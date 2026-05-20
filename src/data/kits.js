// src/data/kits.js
// 定義所有音色庫資料，每套 kit 包含 16 個 pad 的設定

/**
 * @typedef {Object} Pad
 * @property {string} id     - DOM 用的唯一識別碼（對應 fCC 規格）
 * @property {string} key    - 鍵盤按鍵（小寫）
 * @property {string} label  - 顯示在 pad 上的文字
 * @property {string} src    - 音訊檔路徑
 * @property {string} name   - 顯示在 #display 的音效名稱
 */

/**
 * @typedef {Object} Row
 * @property {string} label  - 排的標籤（顯示在 Sequencer 左側）
 * @property {Pad[]}  pads   - 該排的 4 個 pad
 */

/**
 * @typedef {Object} Kit
 * @property {string} id     - kit 的唯一識別碼
 * @property {string} name   - 顯示名稱
 * @property {Row[]}  rows   - 4 排，每排 4 個 pad
 */

/** @type {Kit[]} */

// 這裡定義兩套 kit，分別是 Beat Kit 和 Band Kit，每套包含 16 個 pad 的設定
export const kits = [
  {
    id: 'beat',
    name: 'Beat Kit',
    rows: [
      {
        label: 'Bass',
        pads: [
          { id: '1', key: '1', label: '1', src: './samples/beat/808_bass.wav', name: '808 Bass' },
          { id: '2', key: '2', label: '2', src: './samples/beat/sub_bass.wav', name: 'Sub Bass' },
          { id: '3', key: '3', label: '3', src: './samples/beat/crash.wav', name: 'Crash' },
          { id: '4', key: '4', label: '4', src: './samples/beat/ride.wav', name: 'Ride' },
        ],
      },
      {
        label: 'Drums',
        pads: [
          { id: 'Q', key: 'q', label: 'Q', src: './samples/beat/kick.wav', name: 'Kick' },
          { id: 'W', key: 'w', label: 'W', src: './samples/beat/snare.wav', name: 'Snare' },
          { id: 'E', key: 'e', label: 'E', src: './samples/beat/closed_hh.wav', name: 'Closed HH' },
          { id: 'R', key: 'r', label: 'R', src: './samples/beat/open_hh.wav', name: 'Open HH' },
        ],
      },
      {
        label: 'Perc',
        pads: [
          { id: 'A', key: 'a', label: 'A', src: './samples/beat/clap.wav', name: 'Clap' },
          { id: 'S', key: 's', label: 'S', src: './samples/beat/rimshot.wav', name: 'Rimshot' },
          { id: 'D', key: 'd', label: 'D', src: './samples/beat/shaker.wav', name: 'Shaker' },
          { id: 'F', key: 'f', label: 'F', src: './samples/beat/tom.wav', name: 'Tom' },
        ],
      },
      {
        label: 'FX',
        pads: [
          { id: 'Z', key: 'z', label: 'Z', src: './samples/beat/perc.wav', name: 'Perc' },
          { id: 'X', key: 'x', label: 'X', src: './samples/beat/fx.wav', name: 'FX' },
          { id: 'C', key: 'c', label: 'C', src: './samples/beat/fx2.wav', name: 'FX2' },
          { id: 'V', key: 'v', label: 'V', src: './samples/beat/fills.mp3', name: 'Fill' },
        ],
      },
    ],
  },
  {
    id: 'band',
    name: 'Band Kit',
    rows: [
      {
        label: 'Lead',
        pads: [
          { id: '1', key: '1', label: '1', src: './samples/band/lead_1.wav', name: 'Lead 1' },
          { id: '2', key: '2', label: '2', src: './samples/band/lead_2.wav', name: 'Lead 2' },
          {
            id: '3',
            key: '3',
            label: '3',
            src: './samples/band/vocal_chop.wav',
            name: 'Vocal Chop',
          },
          { id: '4', key: '4', label: '4', src: './samples/band/fx.wav', name: 'FX' },
        ],
      },
      {
        label: 'Drums',
        pads: [
          { id: 'Q', key: 'q', label: 'Q', src: './samples/band/kick.wav', name: 'Kick' },
          { id: 'W', key: 'w', label: 'W', src: './samples/band/snare.wav', name: 'Snare' },
          { id: 'E', key: 'e', label: 'E', src: './samples/band/hihat.wav', name: 'Hi-Hat' },
          { id: 'R', key: 'r', label: 'R', src: './samples/band/crash.wav', name: 'Crash' },
        ],
      },
      {
        label: 'Bass',
        pads: [
          { id: 'A', key: 'a', label: 'A', src: './samples/band/bass_low.wav', name: 'Bass Low' },
          { id: 'S', key: 's', label: 'S', src: './samples/band/bass_mid.wav', name: 'Bass Mid' },
          { id: 'D', key: 'd', label: 'D', src: './samples/band/bass_high.wav', name: 'Bass High' },
          { id: 'F', key: 'f', label: 'F', src: './samples/band/bass_slap.wav', name: 'Bass Slap' },
        ],
      },
      {
        label: 'Guitar',
        pads: [
          {
            id: 'Z',
            key: 'z',
            label: 'Z',
            src: './samples/band/guitar_chord_1.wav',
            name: 'Chord 1',
          },
          {
            id: 'X',
            key: 'x',
            label: 'X',
            src: './samples/band/guitar_chord_2.wav',
            name: 'Chord 2',
          },
          { id: 'C', key: 'c', label: 'C', src: './samples/band/guitar_riff.wav', name: 'Riff' },
          { id: 'V', key: 'v', label: 'V', src: './samples/band/keys.wav', name: 'Keys' },
        ],
      },
    ],
  },
]

export const defaultKit = kits[0] // 預設使用第一套 kit
