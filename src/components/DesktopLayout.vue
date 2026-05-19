<!-- ?銝??Vue 3 蝯辣嚗祕?曆?銝??璈??函?銝餌??Ｕ?雿輻鈭???蝯辣靘?撱箇??ｇ?? PadBank?equencer ??Controls??隞嗅?函恣???嗅???蝯??芋撘?曄???靽⊥嚗蒂??鈭??鈭支??嚗???曌???嗆?整楊頛舐??芋撘???-->
<template>
  <div id="drum-machine" class="app">
    <section class="top-panel">
      <div class="status-bar">
        <div class="status-cell status-display">
          <div class="status-label">STATUS</div>
          <div id="display" class="status-value status-value--big">{{ displayText }}</div>
        </div>
        <div class="status-cell">
          <div class="status-label">PATTERN</div>
          <div class="status-value">{{ patternIndex + 1 }} / {{ patternCount }}</div>
        </div>
        <div class="status-cell">
          <div class="status-label">BPM</div>
          <div class="status-value">{{ bpm }}</div>
        </div>
        <div class="status-cell">
          <div class="status-label">VOL</div>
          <div class="status-value">{{ Math.round(volume * 100) }}%</div>
        </div>
        <div class="status-cell">
          <div class="status-label">KIT</div>
          <div class="status-value">{{ kitName }}</div>
        </div>
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
