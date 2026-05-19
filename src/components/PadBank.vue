<!-- src/components/PadBank.vue -->
 <!-- 鼓墊元件，負責顯示整個鼓墊界面並處理鍵盤輸入 -->
<template>
  <div id="pad-bank" class="pad-bank">
    <div v-for="row in kit.rows" :key="row.label" class="pad-row">
      <span class="row-label">{{ row.label }}</span>
      <DrumPad
        v-for="pad in row.pads"
        :key="pad.id"
        :pad="pad"
        :ref="(el) => setPadRef(pad.key, el)"
        @trigger="onTrigger"
      />
    </div>
  </div>
</template>

<script setup>
// 鼓墊元件，負責顯示整個鼓墊界面並處理鍵盤輸入
import '../assets/components/PadBank.css'
import { ref, onMounted, onUnmounted } from 'vue'
import DrumPad from './DrumPad.vue'

// 定義 props 接收父組件傳遞的套件資料和播放函數
const props = defineProps({
  kit: { type: Object, required: true },
  onPlay: { type: Function, required: true },
})

// 定義 emits 用於向父組件發出事件
const emit = defineEmits(['triggered'])

// 鼓墊引用，用於鍵盤觸發時閃爍效果
const padRefs = ref(Object.create(null))
function setPadRef(key, el) {
  if (el) padRefs.value[key] = el
}

// 處理鼓墊觸發事件，向父組件發出 'triggered' 事件並執行播放
function onTrigger(pad) {
  props.onPlay(pad.id)
  emit('triggered', pad)
}

// 鍵盤事件處理，根據按鍵找到對應的鼓墊並觸發
function onKeyDown(e) {
  if (e.repeat) return

  const key = e.key.toLowerCase()
  const allPads = props.kit.rows.flatMap((row) => row.pads)
  const pad = allPads.find((p) => p.key === key)
  if (!pad) return

  onTrigger(pad)
  padRefs.value[key]?.flash?.()
}

// 註冊和移除鍵盤事件監聽器
onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

// 在組件卸載時移除鍵盤事件監聽器，避免內存洩漏
onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>
