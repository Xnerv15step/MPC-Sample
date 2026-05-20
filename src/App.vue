<!-- 這是一個 Vue 3 組件，實現了一個鼓機應用的主界面。它使用了多個子組件來構建界面，包括 PadBank、Sequencer 和 Controls。組件內部管理了當前的鼓組、節拍模式、播放狀態等信息，並提供了相應的交互功能，如切換鼓組、控制播放、編輯節拍模式等。 -->
<template>
  <DesktopLayout
    :displayText="displayText"
    :patternIndex="viewPatternIndex"
    :patternCount="patternCount"
    :bpm="bpm"
    :volume="volume"
    :kitName="currentKit.name"
    :modeText="transportText"
  >
    <template #sequencer>
      <Sequencer
        :grid="activeGrid"
        :currentStep="currentStep"
        :padNames="padNames"
        :focusPadIndex="focusPadIndex"
        :hit="lastHit"
        :showLabels="false"
        @toggleStep="onToggleStep"
      />
    </template>

    <template #pads>
      <PadBank :kit="currentKit" :onPlay="playPad" @triggered="onTriggered" />
    </template>

    <template #controls>
      <Controls
        :isPlaying="isPlaying"
        :bpm="bpm"
        :volume="volume"
        :kits="kits"
        :currentKitId="currentKit.id"
        @play="onPlay"
        @stop="onStop"
        @clear="onClear"
        @setBpm="setBpm"
        @setVolume="setVolume"
        @switchKit="switchKit"
        @export="exportWav"
      />
    </template>
  </DesktopLayout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import DesktopLayout from './components/DesktopLayout.vue'
import PadBank from './components/PadBank.vue'
import Sequencer from './components/Sequencer.vue'
import Controls from './components/Controls.vue'
import { useAudio } from './composables/useAudio.js'
import { useSequencer } from './composables/useSequencer.js'
import { usePatterns } from './composables/usePatterns.js'
import { useRecorder } from './composables/useRecorder.js'
import { useTransport } from './composables/useTransport.js'
import { useExport } from './composables/useExport.js'
import { kits, defaultKit } from './data/kits.js'

// ── Audio ──────────────────────────────────────────────────────────────────
// 這裡使用了 useAudio composable 來管理音頻相關的功能，包括加載鼓組、播放音效、設置音量等。從 useAudio 中解構出需要的函數和變量。
const { loadKit, playPad, setVolume, volume, getBuffers } = useAudio()

// ── Kit ────────────────────────────────────────────────────────────────────
// 管理當前選擇的鼓組（kit）。初始值為預設的鼓組（defaultKit）。當用戶切換鼓組時，會更新 currentKit 的值並加載新的鼓組。
const currentKit = ref(defaultKit)
const displayText = ref('Ready')

/// 為了方便在其他地方使用鼓組中的 pad 名稱和 id，定義了兩個計算屬性 padNames 和 padIds，分別從當前鼓組的行（rows）中提取出所有 pad 的名稱和 id。
const padNames = computed(() =>
  currentKit.value.rows.flatMap((row) => row.pads.map((pad) => pad.name)),
)

// 這裡使用了 flatMap 來將每一行的 pad 名稱或 id 展平為一個單一的陣列，這樣在其他地方就可以直接使用 padNames 和 padIds 來獲取所有 pad 的名稱和 id。
const padIds = computed(() => currentKit.value.rows.flatMap((row) => row.pads.map((pad) => pad.id)))

// ── Patterns ───────────────────────────────────────────────────────────────
const {
  patterns,
  editPatternIndex,
  playbackPatternIndex,
  maxRecordedPatternIndex,
  patternCount,
  ensurePattern,
  onToggleStep: _onToggleStep,
  resetPatterns,
  getActiveGrid,
} = usePatterns()

// ── Recorder ───────────────────────────────────────────────────────────────
const {
  focusPadIndex,
  lastHit,
  armedStepIndex,
  isStoppedRecording,
  previousStep,
  clearTransientState,
  onTriggered: _onTriggered,
} = useRecorder({ patterns, editPatternIndex, maxRecordedPatternIndex, ensurePattern })

// ── Sequencer ──────────────────────────────────────────────────────────────
// onStep 需要 transport，先宣告後傳入
const { currentStep, bpm, isPlaying, play, pause, stop, setBpm } = useSequencer((step) =>
  onStep(step),
)

// ── Transport ──────────────────────────────────────────────────────────────
// 這裡使用了 useTransport composable 來管理播放控制相關的功能，包括播放、暫停、停止、清除等。從 useTransport 中解構出需要的函數和變量。
const { transportText, onStep, onPlay, onStop, onClear } = useTransport({
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
})

// ── 對外包裝（帶額外參數的 handlers）─────────────────────────────────────
// activeGrid 是一個計算屬性，根據當前的播放狀態（isPlaying）來獲取對應的節拍模式網格。
// 當 isPlaying 為 true 時，activeGrid 會返回正在播放的節拍模式的網格；
// 當 isPlaying 為 false 時，則返回正在編輯的節拍模式的網格。
const activeGrid = computed(() => getActiveGrid(isPlaying.value))

// onToggleStep 是一個事件處理函數，當用戶在 Sequencer 中切換某個步驟的狀態時被觸發。
// 它接受 padIndex 和 stepIndex 兩個參數，分別表示被切換的 pad 的索引和步驟的索引。
// 函數內部調用 _onToggleStep 來更新節拍模式的狀態，並將返回的 stepped 索引賦值給 armedStepIndex，以便在錄音過程中知道哪個步驟被觸發了。
function onToggleStep(padIndex, stepIndex) {
  const stepped = _onToggleStep(padIndex, stepIndex)
  armedStepIndex.value = stepped
}

// onTriggered 是一個事件處理函數，當用戶觸發某個 pad（例如點擊 PadBank 中的 pad）時被觸發。
// 它接受一個 pad 參數，表示被觸發的 pad 的信息。
// 函數內部調用 _onTriggered 來處理這個事件，並傳入當前的相關狀態和參數，以便在錄音過程中正確地記錄這次觸發。
function onTriggered(pad) {
  _onTriggered({
    pad,
    padIds: padIds.value,
    currentStep: currentStep.value,
    isPlaying: isPlaying.value,
    playbackPatternIndex: playbackPatternIndex.value,
    bpm: bpm.value,
    displayText,
  })
}

// ── Kit switching ──────────────────────────────────────────────────────────
// switchKit 是一個事件處理函數，當用戶選擇切換到另一個鼓組時被觸發。
// 它接受 kitId 參數，表示要切換到的鼓組的 ID。
async function switchKit(kitId) {
  onStop()
  onClear()
  currentKit.value = kits.find((k) => k.id === kitId) ?? defaultKit
  await loadKit(currentKit.value)
  displayText.value = `${currentKit.value.name} Loaded`
}

// ── Export ─────────────────────────────────────────────────────────────────
// exportWav 是一個事件處理函數，當用戶選擇導出當前的節拍模式為 WAV 文件時被觸發。
const { exportWav: doExport } = useExport()

function exportWav() {
  doExport({
    patterns: patterns.value.slice(0, maxRecordedPatternIndex.value + 1),
    bpm: bpm.value,
    buffers: getBuffers(),
    padIds: padIds.value,
  })
}

// ── Lifecycle ──────────────────────────────────────────────────────────────
// 在組件掛載時，會加載當前選擇的鼓組，並更新顯示文本為 "Beat Kit Loaded"。
onMounted(async () => {
  await loadKit(currentKit.value)
  displayText.value = 'Beat Kit Loaded'
})

onBeforeUnmount(() => {
  clearTransientState()
})
</script>
