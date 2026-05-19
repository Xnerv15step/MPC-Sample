// usePatterns.js
// 這個 composable 負責管理 patterns 的狀態和邏輯，讓組件可以專注於 UI 和交互

import { ref, computed } from 'vue'

// 管理 patterns 的狀態和邏輯
export function usePatterns() {
  function createEmptyGrid() {
    return Array.from({ length: 16 }, () => Array(16).fill(false))
  }

  const patterns = ref([createEmptyGrid()])
  const editPatternIndex = ref(0)
  const playbackPatternIndex = ref(0)
  const maxRecordedPatternIndex = ref(0)

  // 根據 isPlaying 決定顯示哪個 pattern，由外部傳入 isPlaying
  function getViewPatternIndex(isPlaying) {
    return isPlaying ? playbackPatternIndex.value : editPatternIndex.value
  }

  // 根據 isPlaying 決定顯示哪個 pattern 的 grid，由外部傳入 isPlaying
  function getActiveGrid(isPlaying) {
    const idx = getViewPatternIndex(isPlaying)
    return patterns.value[idx] ?? patterns.value[0]
  }

  // 計算目前有多少個 pattern（從 1 開始）
  const patternCount = computed(() => maxRecordedPatternIndex.value + 1)

  // 確保 patterns 陣列有足夠的 pattern 以供編輯或播放
  function ensurePattern(index) {
    while (patterns.value.length <= index) {
      patterns.value.push(createEmptyGrid())
    }
  }

  // 切換 step 的狀態（true/false），並確保 pattern 存在
  function onToggleStep(padIndex, stepIndex) {
    ensurePattern(editPatternIndex.value)
    const grid = patterns.value[editPatternIndex.value]
    grid[padIndex][stepIndex] = !grid[padIndex][stepIndex]
    return stepIndex
  }

  // 重置所有 patterns，回到初始狀態
  function resetPatterns() {
    patterns.value = [createEmptyGrid()]
    editPatternIndex.value = 0
    playbackPatternIndex.value = 0
    maxRecordedPatternIndex.value = 0
  }

  return {
    patterns,
    editPatternIndex,
    playbackPatternIndex,
    maxRecordedPatternIndex,
    patternCount,
    ensurePattern,
    onToggleStep,
    resetPatterns,
    getActiveGrid,
    getViewPatternIndex,
  }
}
