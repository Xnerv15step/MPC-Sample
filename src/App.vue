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
import { kits, defaultKit } from './data/kits.js'
import { useExport } from './composables/useExport.js'

// 主組件，負責整合鼓墊、音序器和控制面板，管理整體狀態和交互邏輯
const { exportWav: doExport } = useExport()
const { loadKit, playPad, volume, setVolume, getBuffers } = useAudio()

const currentKit = ref(defaultKit)
const displayText = ref('Ready')

// 創建一個空的16x16的節拍模式網格，每行代表一個鼓墊，每列代表一個步驟，初始值為 false（未激活）
function createEmptyGrid() {
  return Array.from({ length: 16 }, () => Array(16).fill(false))
}

// 根據當前套件的鼓墊資料，計算出每個鼓墊的名稱和 ID，供界面顯示和播放使用
const padNames = computed(() =>
  currentKit.value.rows.flatMap((row) => row.pads.map((pad) => pad.name)),
)

// 根據當前套件的鼓墊資料，計算出每個鼓墊的 ID 列表，供播放使用
const padIds = computed(() => currentKit.value.rows.flatMap((row) => row.pads.map((pad) => pad.id)))

// patterns 是一個包含多個節拍模式的陣列，每個模式都是一個16x16的布林值網格，editPatternIndex 和 playbackPatternIndex 分別表示當前正在編輯和播放的模式索引，maxRecordedPatternIndex 用於追蹤已錄製的最大模式索引，以便在界面上顯示總模式數量
const patterns = ref([createEmptyGrid()])
const editPatternIndex = ref(0)
const playbackPatternIndex = ref(0)
const maxRecordedPatternIndex = ref(0)

// viewPatternIndex 是一個計算屬性，根據當前的播放狀態來決定顯示哪個模式的網格，如果正在播放則顯示 playbackPatternIndex 指向的模式，否則顯示 editPatternIndex 指向的模式
const viewPatternIndex = computed(() =>
  isPlaying.value ? playbackPatternIndex.value : editPatternIndex.value,
)

// activeGrid 是一個計算屬性，根據 viewPatternIndex 從 patterns 中獲取當前應該顯示的節拍模式網格，如果對應索引的模式不存在則返回第一個模式
const activeGrid = computed(() => patterns.value[viewPatternIndex.value] ?? patterns.value[0])
const patternCount = computed(() => maxRecordedPatternIndex.value + 1)
const transportText = computed(() => {
  if (isPlaying.value) return 'PLAY'
  if (currentStep.value >= 0) return 'PAUSE'
  if (isStoppedRecording.value) return 'REC'
  return 'IDLE'
})

// ensurePattern 函數用於確保 patterns 中存在指定索引的模式，如果不存在則創建一個新的空模式並添加到 patterns 中
function ensurePattern(index) {
  while (patterns.value.length <= index) patterns.value.push(createEmptyGrid())
}

// onStep 函數在每個步驟觸發時被調用，根據當前的播放模式從 patterns 中獲取對應的節拍模式網格，並根據當前步驟和激活狀態來播放對應的鼓墊聲音，同時處理在小節邊界上的模式切換和播放結束邏輯
function onStep(step) {
  const gridForPlayback = patterns.value[playbackPatternIndex.value] ?? patterns.value[0]
  gridForPlayback.forEach((row, padIndex) => {
    if (row[step]) playPad(padIds.value[padIndex])
  })

  // Advance pattern on bar boundary; stop at the end (non-looping).
  if (isPlaying.value && previousStep.value === 15 && step === 0) {
    if (playbackPatternIndex.value < maxRecordedPatternIndex.value) {
      playbackPatternIndex.value += 1
    } else {
      clearTransientState()
      stop()
      // After finishing, return view to the first page.
      playbackPatternIndex.value = 0
      editPatternIndex.value = 0
      previousStep.value = -1
    }
  }

  previousStep.value = step
}

// 使用 useSequencer 組合函數來管理音序器的播放狀態、當前步驟和 BPM，並將 onStep 函數作為回調傳入，以便在每個步驟觸發時執行相應的邏輯
const { currentStep, bpm, isPlaying, play, pause, stop, setBpm } = useSequencer(onStep)

// onToggleStep 函數處理當用戶在界面上點擊某個步驟格子時的事件，根據點擊的鼓墊索引和步驟索引來切換對應位置的激活狀態，並更新 armedStepIndex 以便在停止模式下錄製時能夠自動前進步驟
function onToggleStep(padIndex, stepIndex) {
  ensurePattern(editPatternIndex.value)
  const grid = patterns.value[editPatternIndex.value]
  grid[padIndex][stepIndex] = !grid[padIndex][stepIndex]
  armedStepIndex.value = stepIndex
}

// onPlay 函數處理播放按鈕的事件，如果當前已經有播放位置（currentStep >= 0），則從暫停位置繼續播放，否則從頭開始播放
function onPlay() {
  // Resume from paused position, otherwise start from beginning.
  clearTransientState()
  if (currentStep.value >= 0) {
    play({ resume: true })
    return
  }

  playbackPatternIndex.value = 0
  previousStep.value = -1
  play()
}

// onStop 函數處理停止按鈕的事件，暫停播放並保持當前的播放位置，以便下次播放時能夠從同一位置繼續
function onStop() {
  // 停止播放並清除暫態狀態，但不重置 currentStep，這樣下次播放時可以從同一位置繼續
  clearTransientState()
  pause()
}

// onClear 函數處理清除按鈕的事件，重置所有的節拍模式為空模式，並重置編輯和播放的模式索引，以及已錄製的最大模式索引，確保界面和狀態回到初始狀態
function onClear() {
  clearTransientState()
  patterns.value = [createEmptyGrid()]
  editPatternIndex.value = 0
  playbackPatternIndex.value = 0
  maxRecordedPatternIndex.value = 0
  previousStep.value = -1
}

// switchKit 函數處理切換套件的事件，首先停止播放並清除當前的節拍模式，然後根據傳入的套件 ID 查找對應的套件資料並加載，最後更新顯示文本以反映新的套件狀態
async function switchKit(kitId) {
  onStop()
  onClear()
  currentKit.value = kits.find((k) => k.id === kitId) ?? defaultKit
  await loadKit(currentKit.value)
  displayText.value = `${currentKit.value.name} Loaded`
}

const focusPadIndex = ref(-1)
const lastHit = ref(null)
const armedStepIndex = ref(0)
let hitTimeoutId = null
let recordClockIntervalId = null
const isStoppedRecording = ref(false)
const previousStep = ref(-1)

// clearTransientState 函數用於清除一些暫態狀態，如焦點鼓墊索引、最後一次擊打的狀態、錄製模式的步驟索引，以及相關的定時器，確保在停止播放或切換套件時能夠重置這些狀態
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

// onTriggered 函數處理當鼓墊被觸發（無論是通過鍵盤還是界面點擊）時的事件，更新顯示文本以反映被觸發的鼓墊名稱，找到對應的鼓墊索引並設置為焦點，然後根據當前的播放狀態來決定將觸發的鼓墊記錄到哪個模式中，最後設置一個定時器來清除最後一次擊打的狀態，以便在界面上顯示相應的擊打效果
function onTriggered(pad) {
  displayText.value = pad?.name ?? 'Ready'

  const padIndex = pad ? padIds.value.indexOf(pad.id) : -1
  if (padIndex < 0) return

  focusPadIndex.value = padIndex

  // 根據當前的播放狀態來決定將觸發的鼓墊記錄到哪個模式中，如果正在播放則記錄到 playbackPatternIndex 指向的模式，否則記錄到 editPatternIndex 指向的模式，這樣在停止模式下錄製時可以自動前進步驟
  // recordingPatternIndex 是一個局部變量，用於確定當前應該記錄到哪個模式中，根據 currentStep 的值來判斷，如果 currentStep >= 0，則表示正在播放，應該記錄到 playbackPatternIndex 指向的模式，否則表示正在編輯，應該記錄到 editPatternIndex 指向的模式
  const recordingPatternIndex =
    currentStep.value >= 0 ? playbackPatternIndex.value : editPatternIndex.value
  ensurePattern(recordingPatternIndex)

  // 根據當前的播放狀態來決定將觸發的鼓墊記錄到哪個模式中，如果正在播放則記錄到 playbackPatternIndex 指向的模式，否則記錄到 editPatternIndex 指向的模式，這樣在停止模式下錄製時可以自動前進步驟
  const stepIndex = currentStep.value >= 0 ? currentStep.value : armedStepIndex.value
  patterns.value[recordingPatternIndex][padIndex][stepIndex] = true
  lastHit.value = { padIndex, stepIndex }
  if (recordingPatternIndex > maxRecordedPatternIndex.value) {
    maxRecordedPatternIndex.value = recordingPatternIndex
  }

  // 在停止模式下錄製時，如果 currentStep < 0 且尚未進入停止錄製狀態，則啟動一個定時器來自動前進步驟，根據當前的 BPM 計算每個步驟的持續時間，並在每個步驟結束時將 armedStepIndex 前進到下一個步驟，當到達小節邊界時自動切換到下一個模式，以便用戶可以在停止模式下錄製連續的節拍模式
  if (currentStep.value < 0 && !isPlaying.value) {
    if (!isStoppedRecording.value) {
      isStoppedRecording.value = true
      const stepMs = 60000 / bpm.value / 4
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

  // 設置一個定時器來清除最後一次擊打的狀態，以便在界面上顯示相應的擊打效果，當鼓墊被觸發時，如果已經存在一個定時器，則先清除它，然後設置一個新的定時器，在 150 毫秒後將 lastHit 設置為 null，這樣可以在界面上顯示短暫的擊打效果
  if (hitTimeoutId) clearTimeout(hitTimeoutId)
  hitTimeoutId = setTimeout(() => {
    lastHit.value = null
    hitTimeoutId = null
  }, 150)
}
// 在組件卸載之前清除一些暫態狀態，確保在離開界面時能夠重置相關的狀態和定時器，避免內存洩漏和不必要的狀態保留
onBeforeUnmount(() => {
  clearTransientState()
})
// 在組件掛載時加載當前套件的聲音資源，並更新顯示文本以反映套件的加載狀態
onMounted(async () => {
  await loadKit(currentKit.value)
  displayText.value = 'Beat Kit Loaded'
})

// exportWav 函數處理匯出按鈕的事件，使用 useExport 組合函數提供的 exportWav 方法來匯出當前的節拍模式為 .wav 文件，傳入的參數包括 patterns 中從第一個模式到 maxRecordedPatternIndex 指向的最後一個已錄製模式的子陣列、當前的 BPM、聲音緩衝區以及鼓墊 ID 列表，以便生成對應的音頻文件
function exportWav() {
  doExport({
    patterns: patterns.value.slice(0, maxRecordedPatternIndex.value + 1),
    bpm: bpm.value,
    buffers: getBuffers(),
    padIds: padIds.value,
  })
}
</script>
