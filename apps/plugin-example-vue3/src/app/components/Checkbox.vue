<template>
  <div class="slm-checkbox" @click="$emit('update:modelValue', !modelValue)">
    <input type="checkbox" :value="label" :checked="modelValue" />
    <span class="check" :class="internalCheckedClass" />
    <span v-if="label" class="checkbox-text" v-html="label" />
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: Boolean,
  label: {
    type: String,
    default: null,
  },
  // Optional override of checkbox class
  checkedClass: {
    type: String,
    default: null,
    validator: (value: string | null) => ['checked', ''].indexOf(value ?? '') !== -1,
  },
})
const { checkedClass, modelValue } = toRefs(props)

const internalCheckedClass = computed(() => {
  if (checkedClass.value === null) {
    return modelValue.value ? 'checked' : ''
  }
  return checkedClass.value
})
</script>

<style lang="postcss">
@import '@theme/css/defines.css';

.slm-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  margin: 8px 16px 16px 0;

  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
  .checkbox-text {
    @mixin title-medium 13px;
    line-height: unset;
  }
  .check {
    height: 16px;
    width: 16px;
    background-color: #fff;
    border: 1px solid $grey1;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    margin-right: 6px;
    &.checked {
      background-color: $main-blue;
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
