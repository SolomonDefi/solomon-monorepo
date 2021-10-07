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
          :options="tr('chargebacks.currency')"
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
import { SlmSelect } from '@solomon/web/ui-widgets'

const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

const props = defineProps({
  prices: {
    type: Object,
    default: () => ({ priceEth: 0, priceSlm: 0, priceUsd: 0 }),
  },
})
const { prices } = toRefs(props)

const getDays = (month: number) => [...Array(monthDays[month - 1] + 1).keys()].slice(1)

const round = (n: number): number => Math.round((n + Number.EPSILON) * 1000000) / 1000000

const month = ref(1)
const days = getDays(1)
const day = ref(1)
const year = ref('2021')
const currency = ref('ETH')
const protection = ref('0%')

const price = computed(() =>
  round(currency.value === 'ETH' ? prices.value.priceEth : prices.value.priceSlm),
)
</script>

<style lang="postcss"></style>
