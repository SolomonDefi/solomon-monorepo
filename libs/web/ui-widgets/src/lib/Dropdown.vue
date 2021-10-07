<template>
  <div
    ref="dropdownWrap"
    class="dropdown"
    :class="{ dropup: top }"
    @mouseleave="mouseLeave"
    @mouseover="mouseOver"
    @mouseenter="mouseEnter"
    @click="toggleMenu"
  >
    <slot />
    <transition :name="transition">
      <div
        v-show="modelValue"
        ref="dropdown"
        class="dropdown-menu show"
        :style="styles"
        @mouseleave="startTimer"
        @mouseenter="stopTimer"
        @click.stop
      >
        <slot name="dropdown" />
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, ref, toRefs, onUnmounted, watch } from 'vue'
const clickEventType = document.ontouchstart !== null ? 'click' : 'touchstart'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: Boolean,
  hover: Boolean,
  hoverTime: {
    type: Number,
    default: 100,
  },
  hoverTimeout: {
    type: Number,
    default: 2500,
  },
  styles: {
    type: Object,
    default: () => ({}),
  },
  interactive: {
    // If true, stays open until clicked outside
    type: Boolean,
    default: true,
  },
  transition: {
    type: String,
    default: '',
  },
  closeOnClickOutside: {
    type: Boolean,
    default: true,
  },
})
const { closeOnClickOutside, hover, hoverTime, hoverTimeout, interactive, modelValue } =
  toRefs(props)

const hovering = ref(false)
const top = ref(false)
const dropdown = ref()
const dropdownWrap = ref()
let hoverOpenTimer: NodeJS.Timeout | null = null
let hoverTimer: NodeJS.Timeout | null = null

watch(modelValue, (v) => {
  if (v) {
    top.value = false
    nextTick(() => {
      const rect = dropdown.value.getBoundingClientRect()
      const windowHeight = window.innerHeight || document.documentElement.clientHeight
      top.value = rect.bottom > windowHeight && rect.top >= rect.height
    })
  }
})
const mouseEnter = () => {
  stopTimer()
  if (hover.value && hoverTime.value > 0 && !modelValue.value) {
    hoverOpenTimer = setTimeout(() => {
      updateValue(true)
      // Briefly disable
      hovering.value = true
      setTimeout(() => {
        hovering.value = false
      }, hoverTimeout.value)
    }, hoverTime.value)
  }
  if (hover.value && !modelValue.value && hoverTime.value === 0) {
    hovering.value = true
    setTimeout(() => {
      hovering.value = false
    }, hoverTimeout.value)
    updateValue(true)
  }
}
const mouseLeave = () => {
  if (!hoverTimer) {
    startTimer()
  }
  if (hoverOpenTimer && hoverTime.value > 0 && hover.value) {
    clearTimeout(hoverOpenTimer)
  }
}
const mouseOver = () => {
  stopTimer()
}
const closeMenu = ($event?: MouseEvent | TouchEvent) => {
  if (!$event || !dropdownWrap.value.contains($event.target)) {
    if (modelValue.value && closeOnClickOutside.value) {
      updateValue(false)
    }
  }
}
const toggleMenu = () => {
  if (hovering.value || (modelValue.value && hover.value)) {
    return
  }
  updateValue(!modelValue.value)
}
const updateValue = (value: boolean) => {
  emit('update:modelValue', value)
  if (value) {
    document.body.addEventListener(clickEventType, closeMenu)
  } else {
    document.body.removeEventListener(clickEventType, closeMenu)
  }
}
const stopTimer = () => {
  if (hoverTimer) {
    clearTimeout(hoverTimer)
    hoverTimer = null
  }
}
const startTimer = () => {
  if (!interactive.value) {
    hoverTimer = setTimeout(() => closeMenu(), hoverTimeout.value)
  }
}
onUnmounted(() => {
  document.body.removeEventListener('click', closeMenu)
})
</script>

<style lang="postcss">
.dropdown {
  position: relative;
  cursor: pointer;
}
.dropdown-menu {
  position: absolute;
  top: 34px;
  z-index: 1000;
  width: 100%;
  left: 0;
  max-height: 120px;
  overflow-y: scroll;
}
</style>
