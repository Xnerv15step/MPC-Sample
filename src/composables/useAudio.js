// src/composables/useAudio.js
import { ref } from 'vue'

/**
 * useAudio 是一個 Vue 3 的組合式函數，用於管理音頻播放和音量控制。
 * 它使用 Web Audio API 來加載和播放音頻樣本，並提供一個響應式的音量控制。
 */
// 這個函數返回一組方法和響應式變量，供組件使用來加載音頻套件、播放鼓墊聲音、設置音量等功能。
export function useAudio() {
  let ctx = null
  let gainNode = null

  // Map<padId, AudioBuffer>
  const buffers = new Map()

  const volume = ref(0.8)

  // 初始化音頻上下文和增益節點，確保只初始化一次
  function initCtx() {
    if (ctx) return
    ctx = new AudioContext()
    gainNode = ctx.createGain()
    gainNode.gain.value = volume.value
    gainNode.connect(ctx.destination)
  }

  // 加載單個音頻樣本，將其解碼為 AudioBuffer 並存儲在 buffers Map 中
  async function loadSound(id, src) {
    try {
      const response = await fetch(src)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
      buffers.set(id, audioBuffer)
    } catch (error) {
      console.error(`Failed to load sample: ${id} (${src})`, error)
    }
  }

  // 加載整個音頻套件，清除現有的緩衝區並加載新套件中的所有鼓墊聲音
  async function loadKit(kit) {
    initCtx()
    buffers.clear()

    const allPads = kit.rows.flatMap((row) => row.pads)
    await Promise.all(allPads.map((pad) => loadSound(pad.id, pad.src)))
  }

  // 播放指定鼓墊的聲音，從 buffers Map 中獲取對應的 AudioBuffer，創建一個新的 BufferSource 並播放
  function playPad(id) {
    if (!ctx) return null

    const buffer = buffers.get(id)
    if (!buffer) {
      console.warn(`Missing buffer for pad: ${id}`)
      return null
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(gainNode)
    source.start()
  }

  // 設置音量，更新響應式的 volume 變量並調整增益節點的值
  function setVolume(val) {
    volume.value = val
    if (gainNode) gainNode.gain.value = val
  }

  // 提供一個方法來獲取當前加載的音頻緩衝區，供組件使用或調試
  function getBuffers() {
    return buffers
  }

  // 返回一組方法和響應式變量，供組件使用來加載音頻套件、播放鼓墊聲音、設置音量等功能
  return {
    loadKit,
    playPad,
    volume,
    setVolume,
    getBuffers,
  }
}
