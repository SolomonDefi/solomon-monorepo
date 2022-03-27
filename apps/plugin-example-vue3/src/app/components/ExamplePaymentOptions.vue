<template>
  <div class="payment-options">
    <div v-for="(plugin, idx) in plugins" :key="idx">
      <Checkbox
        v-model="plugin.checked"
        class="slm-check"
        :label="`Enable ${plugin.name}`"
      />
      <div
        v-if="plugin.checked"
        class="payment-solomon title"
        @click="emit('update:modelValue', plugin.name)"
      >
        {{ plugin.name }}
      </div>
      <div v-else />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Checkbox } from '@solomon/web/ui-widgets'

interface CheckedPlugin {
  name: string
  checked: boolean
}

defineProps<{
  modelValue: string | null
  plugins: CheckedPlugin[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: string | null): void
}>()
</script>
