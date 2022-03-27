<template>
  <div class="slm-plugin-escrow">
    <div class="slm-plugin-content-title">
      {{ ts('escrow.enter') }}
    </div>
    <div class="slm-plugin-content">
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
          {{ ts('chargebacks.schedule') }}
        </div>
        <div class="slm-plugin-row-right">
          <SlmSelect
            v-model="year"
            :options="['2021', '2022', '2023']"
            class="slm-plugin-year"
          />
          <SlmSelect
            v-model="month"
            :options="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]"
            class="slm-plugin-month"
            @update:modelValue="days = getDays($event)"
          />
          <SlmSelect v-model="day" :options="days" />
        </div>
      </div>
      <div class="slm-plugin-content-row">
        <div class="slm-plugin-select-title">
          {{ ts('chargebacks.protection') }}
        </div>
        <SlmSelect
          v-model="protection"
          :options="[
            '0%',
            '5%',
            '10%',
            '15%',
            '20%',
            '25%',
            '30%',
            '35%',
            '40%',
            '45%',
            '50%',
          ]"
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
import { ref, toRefs } from 'vue'
import { ts, tr } from './i18n'
import { SlmSelect } from '@solomon/web/ui-widgets'
import { usePrice } from './composables'

const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

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

const getDays = (month: number) => [...Array(monthDays[month - 1] + 1).keys()].slice(1)

const month = ref(1)
const days = getDays(1)
const day = ref(1)
const year = ref('2021')
const protection = ref('0%')
</script>

<style lang="postcss">
.slm-plugin-escrow {
}
</style>
