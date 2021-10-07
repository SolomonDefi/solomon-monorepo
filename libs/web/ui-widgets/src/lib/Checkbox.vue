<template>
  <div class="slm-checkbox" :class="{ disabled }" @click="handleCheck($event, !checked)">
    <input type="checkbox" :value="label" :checked="checked" :disabled="disabled" />
    <span class="checkmark" :class="internalCheckedClass" />
    <span v-if="label" class="checkbox-text" v-html="label" />
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

const emit = defineEmits(['checked'])
const props = defineProps({
  checked: Boolean,
  label: {
    type: String,
    default: '',
  },
  // Optional override of checkbox class
  checkedClass: {
    type: String,
    default: null,
    validator: (value: string | null) =>
      ['partial', 'checked', ''].indexOf(value || '') !== -1,
  },
  disabled: {
    type: Boolean,
  },
})
const { checkedClass, disabled, checked } = toRefs(props)

const internalCheckedClass = computed(() => {
  if (checkedClass.value === null) {
    return checked.value ? 'checked' : ''
  }
  return checkedClass
})
const handleCheck = (event: MouseEvent, checked: boolean) => {
  if (!disabled.value && (event.target as HTMLElement).nodeName !== 'A') {
    emit('checked', checked)
  }
}
</script>

<style lang="postcss">
@import '@theme/css/defines.css';

.slm-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  margin: 8px 16px 16px 0;

  &.disabled {
    cursor: not-allowed;
  }

  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .checkbox-text {
    @mixin text 14px;
  }

  .checkmark {
    height: 16px;
    width: 16px;
    background-color: #fff;
    border-radius: 2px;
    border: 1px solid rgba(0, 0, 0, 0.7);
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    margin-right: 8px;

    &.partial {
      background-color: $blue;
      &::after {
        content: '';
        display: block;
        width: 6px;
        border: solid #fff;
        border-width: 0 2px 2px 0;
      }
    }
    &.checked {
      background-color: $blue;
      border: 1px solid transparent;

      &::after {
        content: '';
        display: block;
        width: 3px;
        height: 6px;
        border: solid #fff;
        border-width: 0 2px 2px 0;
        transform: translate(0, -1px) rotate(45deg);
      }
    }
  }
}
</style>
