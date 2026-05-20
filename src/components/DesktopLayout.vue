<!-- DesktopLayout.vue 是一個 Vue 組件，負責渲染桌面版的鼓機界面。它包含了狀態顯示區、節拍器面板、以及底部的控制區和 Pad 區。組件通過 props 接收來自父組件（App.vue）的狀態和數據，並使用 slot 來插入具體的子組件（如 Sequencer、PadBank 和 Controls）。 -->
<template>
  <!-- 整體容器，包含了整個鼓機的界面結構 -->
  <div id="drum-machine" class="app">
    <section class="top-panel">
      <div class="status-bar">
        <div class="status-cell status-display">
          <div class="status-label">STATUS</div>
          <div id="display" class="status-value status-value--big">{{ displayText }}</div>
        </div>
        <!-- 顯示當前的 pattern 索引和總數 -->
        <div class="status-cell">
          <div class="status-label">PATTERN</div>
          <div class="status-value">{{ patternIndex + 1 }} / {{ patternCount }}</div>
        </div>
        <!-- 顯示當前的 BPM、音量、套件名稱和模式文本 -->
        <div class="status-cell">
          <div class="status-label">BPM</div>
          <div class="status-value">{{ bpm }}</div>
        </div>
        <!-- 顯示當前的音量百分比 -->
        <div class="status-cell">
          <div class="status-label">VOL</div>
          <div class="status-value">{{ Math.round(volume * 100) }}%</div>
        </div>
        <!-- 顯示當前的鼓組名稱 -->
        <div class="status-cell">
          <div class="status-label">KIT</div>
          <div class="status-value">{{ kitName }}</div>
        </div>
        <!-- 顯示當前的模式文本，例如 "Playing" 或 "Stopped" -->
        <div class="status-cell">
          <div class="status-label">MODE</div>
          <div class="status-value">{{ modeText }}</div>
        </div>
      </div>

      <div class="sequencer-panel">
        <slot name="sequencer" />
      </div>
    </section>

    <section class="bottom-panel">
      <div class="bottom-left">
        <slot name="pads" />
      </div>
      <div class="bottom-right">
        <slot name="controls" />
      </div>
    </section>
  </div>
</template>

<script setup>
// 定義組件的 props，這些 props 包含了從父組件傳遞過來的狀態和數據，用於在界面上顯示當前的狀態信息。
defineProps({
  displayText: { type: String, required: true },
  patternIndex: { type: Number, required: true },
  patternCount: { type: Number, required: true },
  bpm: { type: Number, required: true },
  volume: { type: Number, required: true },
  kitName: { type: String, required: true },
  modeText: { type: String, required: true },
})
</script>
