<!-- src/components/DrumPad.vue -->
<template>
  <!-- 鼓墊元件，負責顯示單個鼓墊並處理點擊事件 -->
  <div :data-key="pad.key" class="drum-pad" :class="{ active: isActive }" @click="handleTrigger">
    {{ pad.label }}
  </div>
</template>

// 鼓墊元件，負責顯示單個鼓墊並處理點擊事件
<script setup>
import '../assets/components/Drum.css'
import { ref } from 'vue'

// 定義 props 接收父組件傳遞的鼓墊資料
const props = defineProps({
  pad: { type: Object, required: true },
})

// 定義 emits 用於向父組件發出事件
const emit = defineEmits(['trigger'])
const isActive = ref(false)

// 鼓墊閃爍效果
function flash() {
  isActive.value = true
  setTimeout(() => {
    isActive.value = false
  }, 100)
}

// 處理鼓墊觸發事件，向父組件發出 'trigger' 事件並執行閃爍效果
function handleTrigger() {
  emit('trigger', props.pad)
  flash()
}

// 將 flash 方法暴露給父組件，以便在外部觸發鼓墊閃爍效果
defineExpose({ flash })
</script>
