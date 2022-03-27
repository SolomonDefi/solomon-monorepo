import { computed, Ref, ref } from 'vue'

export const round = (n: number): number =>
  Math.round((n + Number.EPSILON) * 1000000) / 1000000

export const usePrice = (prices: Ref<Record<string, number>>) => {
  const currency = ref('SLM')

  const roundedPrice = computed(() =>
    round(currency.value === 'ETH' ? prices.value.priceEth : prices.value.priceSlm),
  )

  return { currency, roundedPrice }
}
