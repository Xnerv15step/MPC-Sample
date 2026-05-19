// useTransport.js
// 這個 composable 負責管理 transport 的狀態和行為，包括播放、暫停、停止、清除等功能，以及在每個 sequencer 步驟觸發時執行的邏輯。
import { computed } from 'vue'

// 這個 composable 接收多個參數，這些參數來自於父組件，包含 transport 的狀態和操作函數，以及 patterns 和 playbackPatternIndex 等相關狀態。
export function useTransport({
  isPlaying,
  currentStep,
  isStoppedRecording,
  play,
  pause,
  stop,
  clearTransientState,
  resetPatterns,
  patterns,
  playbackPatternIndex,
  maxRecordedPatternIndex,
  editPatternIndex,
  previousStep,
  padIds,
  playPad,
}) {
  const transportText = computed(() => {
    if (isPlaying.value) return 'PLAY'
    if (currentStep.value >= 0) return 'PAUSE'
    if (isStoppedRecording.value) return 'REC'
    return 'IDLE'
  })

  // 每個 sequencer 步驟觸發時執行
  function onStep(step) {
    const gridForPlayback = patterns.value[playbackPatternIndex.value] ?? patterns.value[0]
    gridForPlayback.forEach((row, padIndex) => {
      if (row[step]) playPad(padIds.value[padIndex])
    })

    // 小節結束時切換 pattern；播完最後一個 pattern 後停止
    if (isPlaying.value && previousStep.value === 15 && step === 0) {
      if (playbackPatternIndex.value < maxRecordedPatternIndex.value) {
        playbackPatternIndex.value += 1
      } else {
        clearTransientState()
        stop()
        playbackPatternIndex.value = 0
        editPatternIndex.value = 0
        previousStep.value = -1
      }
    }

    previousStep.value = step
  }

  // 播放按鈕的行為：如果已經在播放，則繼續播放；如果在暫停，則從當前步驟繼續播放；如果在停止或空閒狀態，則從頭開始播放。
  function onPlay() {
    clearTransientState()
    if (currentStep.value >= 0) {
      play({ resume: true })
      return
    }
    playbackPatternIndex.value = 0
    previousStep.value = -1
    play()
  }

  // 停止按鈕的行為：清除暫態狀態並暫停播放。
  function onStop() {
    clearTransientState()
    pause()
  }

  // 清除按鈕的行為：清除暫態狀態、重置 patterns，並將 previousStep 重置為 -1。
  function onClear() {
    clearTransientState()
    resetPatterns()
    previousStep.value = -1
  }

  return {
    transportText,
    onStep,
    onPlay,
    onStop,
    onClear,
  }
}
