<!-- src/components/Sequencer.vue -->
<!-- 步進式音序器元件，負責顯示和控制音序器界面 -->
<template>
  <div class="sequencer">
    <!-- 每一行代表一個鼓墊，每個格子代表一個步驟，根據當前步驟、是否激活和是否被擊中來設定樣式，並處理點擊事件切換步驟狀態 -->
    <div
      v-for="(row, padIndex) in grid"
      :key="padIndex"
      class="sequencer-row"
      :class="{ 'is-focused': padIndex === focusPadIndex }"
    >
      <span
        v-if="showLabels"
        class="sequencer-label"
        :class="{ 'is-hit': hit?.padIndex === padIndex }"
      >
        {{ padNames[padIndex] }}
      </span>
      <!-- 每個步驟格子，根據當前步驟、是否激活和是否被擊中來設定樣式，並處理點擊事件切換步驟狀態 -->
      <div
        v-for="(active, stepIndex) in row"
        :key="stepIndex"
        class="sequencer-step"
        :class="{
          'is-active': active,
          'is-current': stepIndex === currentStep,
          'is-hit': hit?.padIndex === padIndex && hit?.stepIndex === stepIndex,
        }"
        @click="emit('toggleStep', padIndex, stepIndex)"
      ></div>
    </div>
  </div>
</template>

<script setup>
import '../assets/components/Sequencer.css'

// 定義 props 接收父組件傳遞的音序器資料和狀態
defineProps({
  grid: { type: Array, required: true },
  currentStep: { type: Number, required: true },
  padNames: { type: Array, required: true },
  focusPadIndex: { type: Number, default: -1 },
  hit: { type: Object, default: null },
  showLabels: { type: Boolean, default: false },
})

// 定義 emits 用於向父組件發出事件
const emit = defineEmits(['toggleStep'])
</script>
