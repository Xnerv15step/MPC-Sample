// src/composables/useSequencer.js
import { ref, computed } from 'vue'

/**
 * useSequencer 是一個 Vue 3 的組合式函數，用於管理音序器的播放狀態、當前步驟和 BPM。它提供 play、pause、stop 和 setBpm 方法來控制音序器的運行。
 * 音序器以 16 步為一個循環，每個步驟的持續時間由 BPM 決定，當播放時會定期調用 onStep 回調函數，傳遞當前的步驟索引（0 到 15）。
 *
 * @param {(step: number) => void} onStep - 在每個節拍（0..15）上調用的回調函數
 * @returns {Object} 包含 currentStep、bpm、isPlaying、play、pause、stop 和 setBpm 的對象
 * @param {(step: number) => void} onStep - called on each tick (0..15)
 */

// 這個函數使用 setInterval 來實現節拍的定時調用，並根據 BPM 動態調整節拍間隔。當 BPM 改變時，如果正在播放，會重新啟動定時器以應用新的節拍速度。
export function useSequencer(onStep) {
  const currentStep = ref(-1)
  const bpm = ref(120)
  const isPlaying = ref(false)

  let intervalId = null

  // stepIntervalMs 是一個計算屬性，根據當前的 BPM 計算每個步驟的持續時間（以毫秒為單位），默認情況下每個步驟是四分之一拍。
  const stepIntervalMs = computed(() => 60000 / bpm.value / 4)

  // tick 函數在每個節拍觸發時被調用，更新 currentStep 並調用 onStep 回調函數來通知當前步驟
  function tick() {
    currentStep.value = (currentStep.value + 1) % 16
    onStep(currentStep.value)
  }

  // startInterval 函數用於啟動 setInterval 定時器，根據 stepIntervalMs 的值來調用 tick 函數
  function startInterval() {
    intervalId = setInterval(tick, stepIntervalMs.value)
  }

  // play 函數開始播放音序器，如果 resume 為 false，則從頭開始播放（currentStep 設置為 -1），否則從當前步驟繼續播放
  function play({ resume = false } = {}) {
    if (isPlaying.value) return
    isPlaying.value = true
    if (!resume) currentStep.value = -1
    startInterval()
  }

  // pause 函數暫停播放音序器，清除定時器並保持當前步驟不變
  function pause() {
    isPlaying.value = false
    if (intervalId) clearInterval(intervalId)
    intervalId = null
  }

  // stop 函數停止播放音序器，清除定時器並重置 currentStep 為 -1
  function stop() {
    isPlaying.value = false
    currentStep.value = -1
    if (intervalId) clearInterval(intervalId)
    intervalId = null
  }

  // setBpm 函數用於設置新的 BPM 值，並在正在播放的情況下重新啟動定時器以應用新的節拍速度
  function setBpm(val) {
    bpm.value = val
    if (!isPlaying.value) return

    if (intervalId) clearInterval(intervalId)
    startInterval()
  }

  // 返回一組方法和響應式變量，供組件使用來控制音序器的播放狀態、當前步驟和 BPM
  return {
    currentStep,
    bpm,
    isPlaying,
    play,
    pause,
    stop,
    setBpm,
  }
}
