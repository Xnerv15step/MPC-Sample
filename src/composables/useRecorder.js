// useRecorder.js
// 這個 composable 負責處理錄音相關的狀態和邏輯

import { ref } from 'vue'

// useRecorder 負責處理錄音相關的狀態和邏輯
export function useRecorder({
  patterns,
  editPatternIndex,
  maxRecordedPatternIndex,
  ensurePattern,
}) {
  const focusPadIndex = ref(-1)
  const lastHit = ref(null)
  const armedStepIndex = ref(0)
  const isStoppedRecording = ref(false)
  const previousStep = ref(-1)

  let hitTimeoutId = null
  let recordClockIntervalId = null

  // 清除錄音過程中的暫態狀態，例如當停止錄音或切換 pattern 時使用
  function clearTransientState() {
    focusPadIndex.value = -1
    lastHit.value = null
    armedStepIndex.value = 0

    if (hitTimeoutId) clearTimeout(hitTimeoutId)
    hitTimeoutId = null

    if (recordClockIntervalId) clearInterval(recordClockIntervalId)
    recordClockIntervalId = null

    isStoppedRecording.value = false
  }

  // 當鼓墊被觸發時，記錄到對應的 pattern
  // 需傳入 { pad, padIds, currentStep, isPlaying, playbackPatternIndex, bpm }
  function onTriggered({
    pad,
    padIds,
    currentStep,
    isPlaying,
    playbackPatternIndex,
    bpm,
    displayText,
  }) {
    // 更新顯示的文字為被觸發的 pad 的名稱，或如果沒有 pad 就顯示 "Ready"
    if (displayText) displayText.value = pad?.name ?? 'Ready'

    const padIndex = pad ? padIds.indexOf(pad.id) : -1
    if (padIndex < 0) return

    focusPadIndex.value = padIndex

    const recordingPatternIndex = currentStep >= 0 ? playbackPatternIndex : editPatternIndex.value
    ensurePattern(recordingPatternIndex)

    const stepIndex = currentStep >= 0 ? currentStep : armedStepIndex.value
    patterns.value[recordingPatternIndex][padIndex][stepIndex] = true
    lastHit.value = { padIndex, stepIndex }

    if (recordingPatternIndex > maxRecordedPatternIndex.value) {
      maxRecordedPatternIndex.value = recordingPatternIndex
    }

    // 停止模式下的自動步驟推進
    if (currentStep < 0 && !isPlaying) {
      if (!isStoppedRecording.value) {
        isStoppedRecording.value = true
        const stepMs = 60000 / bpm / 4
        recordClockIntervalId = setInterval(() => {
          const next = (armedStepIndex.value + 1) % 16
          const wrapped = armedStepIndex.value === 15 && next === 0
          armedStepIndex.value = next
          if (wrapped) {
            editPatternIndex.value += 1
            ensurePattern(editPatternIndex.value)
          }
        }, stepMs)
      }
    }

    // 每次觸發後 150ms 清除 lastHit，這樣 UI 上的觸感反饋就會有一個短暫的顯示效果
    if (hitTimeoutId) clearTimeout(hitTimeoutId)
    hitTimeoutId = setTimeout(() => {
      lastHit.value = null
      hitTimeoutId = null
    }, 150)
  }

  return {
    focusPadIndex,
    lastHit,
    armedStepIndex,
    isStoppedRecording,
    previousStep,
    clearTransientState,
    onTriggered,
  }
}
