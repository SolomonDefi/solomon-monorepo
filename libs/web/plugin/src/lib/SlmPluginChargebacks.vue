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
          :options="tr('chargebacks.currency')"
          class="slm-plugin-row-right"
        />
      </div>
      <div class="slm-plugin-content-row">
        <div class="slm-plugin-select-title">
          {{ ts('chargebacks.price') }}
        </div>
        <div class="slm-plugin-row-right">
          <div class="slm-plugin-price">
            {{ price || '0' }}
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
import { ref, computed, toRefs } from 'vue'
import { ts, tr } from './i18n'

const props = defineProps({
  prices: {
    type: Object,
    default: () => ({ priceEth: 0, priceSlm: 0, priceUsd: 0 }),
  },
})
const { prices } = toRefs(props)

const currency = ref('SLM')

const round = (n: number): number => Math.round((n + Number.EPSILON) * 1000000) / 1000000

const price = computed(() =>
  round(currency.value === 'ETH' ? prices.value.priceEth : prices.value.priceSlm),
)
const priceUsd = computed(() => {
  return `$${(prices.value.priceUsd / 100).toLocaleString()}`
})
</script>

<style lang="postcss">
.slm-plugin-chargebacks {
}
</style>
