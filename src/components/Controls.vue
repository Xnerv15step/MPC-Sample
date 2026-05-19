<!-- src/components/Controls.vue -->
<!-- 控制元件，包含播放、停止、清除、BPM調整、音量控制、套件切換和匯出功能 -->
<template>
  <div class="controls">
    <div class="controls-group controls-group--transport">
      <button class="btn-play" :disabled="isPlaying" @click="emit('play')">Play</button>
      <button class="btn-stop" :disabled="!isPlaying" @click="emit('stop')">Stop</button>
      <button class="btn-clear" @click="emit('clear')">Clear</button>
    </div>
    <!-- BPM控制，使用 range input 調整BPM並顯示當前值 -->
    <div class="controls-group">
      <label>BPM</label>
      <input
        type="range"
        min="60"
        max="200"
        :value="bpm"
        @input="(e) => emit('setBpm', Number(e.target.value))"
      />
      <span class="controls-value">{{ bpm }}</span>
    </div>
    <!-- 音量控制，使用 range input 調整音量並顯示百分比 -->
    <div class="controls-group">
      <label>VOL</label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        :value="volume"
        @input="(e) => emit('setVolume', Number(e.target.value))"
      />
      <span class="controls-value">{{ Math.round(volume * 100) }}%</span>
    </div>
    <!-- 套件選擇，列出所有套件按鈕並高亮當前選擇的套件 -->
    <div class="controls-group">
      <button
        v-for="kit in kits"
        :key="kit.id"
        class="btn-kit"
        :class="{ 'is-active': currentKitId === kit.id }"
        @click="emit('switchKit', kit.id)"
      >
        {{ kit.name }}
      </button>
    </div>
    <!-- 匯出按鈕，觸發匯出事件 -->
    <div class="controls-group">
      <button class="btn-export" @click="emit('export')">Export .wav</button>
    </div>
  </div>
</template>

<script setup>
// 按鍵、BPM、音量、套件選擇等控制元件
import '../assets/components/Controls.css'

defineProps({
  isPlaying: { type: Boolean, required: true },
  bpm: { type: Number, required: true },
  volume: { type: Number, required: true },
  kits: { type: Array, required: true },
  currentKitId: { type: String, required: true },
})

const emit = defineEmits(['play', 'stop', 'clear', 'setBpm', 'setVolume', 'switchKit', 'export'])
</script>
