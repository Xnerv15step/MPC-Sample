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
const { loadKit, playPad, setVolume, volume, getBuffers } = useAudio()

// ── Kit ────────────────────────────────────────────────────────────────────
const currentKit = ref(defaultKit)
const displayText = ref('Ready')

const padNames = computed(() =>
  currentKit.value.rows.flatMap((row) => row.pads.map((pad) => pad.name)),
)
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
const activeGrid = computed(() => getActiveGrid(isPlaying.value))

function onToggleStep(padIndex, stepIndex) {
  const stepped = _onToggleStep(padIndex, stepIndex)
  armedStepIndex.value = stepped
}

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
async function switchKit(kitId) {
  onStop()
  onClear()
  currentKit.value = kits.find((k) => k.id === kitId) ?? defaultKit
  await loadKit(currentKit.value)
  displayText.value = `${currentKit.value.name} Loaded`
}

// ── Export ─────────────────────────────────────────────────────────────────
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
onMounted(async () => {
  await loadKit(currentKit.value)
  displayText.value = 'Beat Kit Loaded'
})

onBeforeUnmount(() => {
  clearTransientState()
})
</script>
