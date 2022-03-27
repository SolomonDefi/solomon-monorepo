<template>
  <div class="slm-plugin-chargebacks">
    <div class="slm-plugin-content-title">
      {{ ts('chargebacks.select') }}
    </div>
    <div class="slm-plugin-content">
      <div class="slm-plugin-content-row">
        <div class="slm-plugin-select-title">
          {{ ts('chargebacks.usd_price') }}
        </div>
        <div class="slm-plugin-row-right">
          {{ priceUsd }}
        </div>
      </div>
      <div class="slm-plugin-content-row">
        <div class="slm-plugin-select-title">
          {{ ts('chargebacks.select_label') }}
        </div>
        <SlmSelect
          v-model="currency"
          :options="(tr('chargebacks.currency') as Record<string, string>)"
          class="slm-plugin-row-right"
        />
      </div>
      <div class="slm-plugin-content-row">
        <div class="slm-plugin-select-title">
          {{ ts('chargebacks.price') }}
        </div>
        <div class="slm-plugin-row-right">
          <div class="slm-plugin-price">
            {{ roundedPrice || '0' }}
            <div class="slm-plugin-currency">
              {{ currency }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { SlmSelect } from '@solomon/web/ui-widgets'
import { ts, tr } from './i18n'
import { usePrice } from './composables'

const props = withDefaults(
  defineProps<{
    prices: Record<string, number>
  }>(),
  {
    prices: () => ({ priceEth: 0, priceSlm: 0, priceUsd: 0 }),
  },
)
const { prices } = toRefs(props)

const { currency, roundedPrice } = usePrice(prices)

const priceUsd = computed(() => {
  return `$${(prices.value.priceUsd / 100).toLocaleString()}`
})
</script>

<style lang="postcss">
.slm-plugin-chargebacks {
}
</style>
