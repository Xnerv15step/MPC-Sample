import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 這是一個使用 Pinia 定義的 Vue 3 狀態管理 store，名為 useCounterStore。它包含一個響應式變量 count、一個計算屬性 doubleCount 和一個方法 increment。
// count 是一個響應式的整數，初始值為 0。doubleCount 是一個計算屬性，返回 count 的兩倍。increment 是一個方法，用於將 count 的值增加 1。
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})
