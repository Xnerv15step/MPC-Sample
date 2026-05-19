// src/composables/useExport.js

//  useExport 是一個 Vue 3 的組合式函數，用於將當前的音序器模式導出為 WAV 音頻文件。它使用 OfflineAudioContext 來在背景中渲染整首歌曲，然後將渲染結果轉換為 WAV 格式並觸發下載。
// https://stackoverflow.com/questions/19327557/javascript-audio-buffer-to-wav

// 將字符串寫入 DataView 的幫助函數，用於構建 WAV 文件的 RIFF 和 fmt chunk
function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

// 將 AudioBuffer 轉換為 WAV 格式的 ArrayBuffer，支持多聲道和 16 位深度
function audioBufferToWav(audioBuffer) {
  const numChannels = audioBuffer.numberOfChannels
  const sampleRate = audioBuffer.sampleRate
  const format = 1 // PCM
  const bitDepth = 16

  // 獲取每個聲道的樣本數據，準備寫入 WAV 文件
  const channels = []
  for (let i = 0; i < numChannels; i++) channels.push(audioBuffer.getChannelData(i))

  const totalSamples = audioBuffer.length * numChannels
  const buffer = new ArrayBuffer(44 + totalSamples * 2)
  const view = new DataView(buffer)

  // 寫入 WAV 文件頭，包括 RIFF chunk、fmt chunk 和 data chunk 的標識和大小信息
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + totalSamples * 2, true)
  writeString(view, 8, 'WAVE')

  // fmt chunk
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, format, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, (sampleRate * numChannels * bitDepth) / 8, true)
  view.setUint16(32, (numChannels * bitDepth) / 8, true)
  view.setUint16(34, bitDepth, true)

  // data chunk
  writeString(view, 36, 'data')
  view.setUint32(40, totalSamples * 2, true)

  // 將每個聲道的樣本數據寫入 WAV 文件，將浮點數樣本轉換為 16 位整數並交錯存儲
  let offset = 44
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]))
      view.setInt16(offset, sample < 0 ? sample * 32768 : sample * 32767, true)
      offset += 2
    }
  }

  return buffer
}

// useExport 組合式函數，提供 exportWav 方法來導出當前的音序器模式為 WAV 文件
export function useExport() {
  async function exportWav({ patterns, bpm, buffers, padIds }) {
    const stepDuration = 60 / bpm / 4
    const safePatterns = Array.isArray(patterns) ? patterns : []
    const totalSteps = Math.max(1, safePatterns.length) * 16
    const totalDuration = stepDuration * totalSteps

    // 確保至少有一個樣本被加載，否則無法渲染音頻，並提示用戶導出失敗
    const firstBuffer = [...buffers.values()][0]
    if (!firstBuffer) {
      console.warn('No samples loaded; export skipped.')
      return
    }

    // 使用 OfflineAudioContext 在背景中渲染整首歌曲，根據 patterns 中的激活步驟來安排每個樣本的播放時間
    const sampleRate = firstBuffer.sampleRate
    const offlineCtx = new OfflineAudioContext(2, Math.ceil(totalDuration * sampleRate), sampleRate)

    // 創建增益節點來控制整首歌曲的音量，並將其連接到離線上下文的目的地
    const gainNode = offlineCtx.createGain()
    gainNode.gain.value = 0.8
    gainNode.connect(offlineCtx.destination)

    // 遍歷 patterns 中的每個步驟格子，根據是否激活來安排對應樣本的播放時間，創建 BufferSource 並連接到增益節點
    safePatterns.forEach((grid, patternIndex) => {
      grid.forEach((row, padIndex) => {
        const padId = padIds[padIndex]
        const buffer = buffers.get(padId)
        if (!buffer) return

        row.forEach((active, stepIndex) => {
          if (!active) return

          const absoluteStep = patternIndex * 16 + stepIndex
          const startTime = absoluteStep * stepDuration
          const source = offlineCtx.createBufferSource()
          source.buffer = buffer
          source.connect(gainNode)
          source.start(startTime)
        })
      })
    })

    // 開始渲染離線上下文，獲取渲染完成的 AudioBuffer，然後將其轉換為 WAV 格式並觸發下載
    const renderedBuffer = await offlineCtx.startRendering()
    const wavBuffer = audioBufferToWav(renderedBuffer)

    // 創建一個 Blob 對象來存儲 WAV 數據，然後創建一個臨時的下載鏈接並觸發點擊事件來下載文件，最後釋放 URL 對象
    const blob = new Blob([wavBuffer], { type: 'audio/wav' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'song.wav'
    a.click()
    URL.revokeObjectURL(url)
  }

  return { exportWav }
}
