<template>
  <div class="checkout">
    <div class="container">
      <div class="checkout-payment">
        <div class="section-head">
          <div class="head-line1 title">
            {{ text.title }}
          </div>
          <div class="head-line2 title">
            {{ text.subtitle }}
          </div>
        </div>
        <div class="payment-amount">
          <div>{{ text.charge_amount }}</div>
          <SlmInput v-model="price" />
        </div>
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
              @click="paymentType = plugin.name"
            >
              {{ plugin.name }}
            </div>
            <div v-else />
          </div>
        </div>
      </div>
    </div>
    <SlmPlugin
      :show="!!paymentType"
      :initialType="paymentType"
      :availableTypes="enabled"
      :priceUsdCents="priceCents"
      @cancel="paymentType = null"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
// eslint-disable-next-line import/extensions
import { SlmPlugin } from '../../../../dist/libs/web/plugin/plugin.es.js'

const text = {
  title: 'Solomon Plugin Example',
  subtitle: 'Configure and run the plugin.',
  charge_amount: 'Charge Amount (USD)',
}

const price = ref('5')
const paymentType = ref<string | null>(null)
// const enableChargebacks = ref(true)
// const enablePreorder = ref(true)
// const enableEscrow = ref(true)
const priceCents = computed(() => {
  if (Number.isNaN(price.value)) {
    return 0
  }
  return parseFloat(price.value) * 100
})
const plugins = ref([
  { name: 'chargebacks', checked: true },
  { name: 'preorder', checked: true },
  { name: 'escrow', checked: true },
])
const enabled = computed(() => plugins.value.filter((p) => p.checked).map((p) => p.name))
</script>

<style lang="postcss">
@import '../../../../dist/libs/web/plugin/style.css';

html,
body {
  padding: 0;
  margin: 0;
  width: 100%;
  background-color: #f9f9f9;

  color: black;
  * {
    box-sizing: border-box;
  }
}
.container {
  max-width: 900px;
  margin: 0 auto;
  padding-top: 48px;
  display: flex;
  justify-content: center;
}
.checkout-payment {
  width: 680px;
}
.title {
  font-family: Arial, sans-serif;
  font-weight: 700;
}
.checkout {
  text-align: center;
}
.slm-checks {
  margin-top: 24px;
  display: flex;
  justify-content: space-around;
}
.payment-options {
  display: flex;
  margin-top: 16px;
}
.slm-check {
  align-self: center;
}
.payment-amount {
  margin-top: 24px;
  font-size: 15px;
  font-family: Arial, sans-serif;
  font-weight: 500;
  .slm-input-wrap {
    max-width: 200px;
    margin: 16px auto;
    .slm-input {
      height: 48px;
    }
  }
}
.payment-options > div {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  cursor: pointer;
  flex-grow: 1;
}
.payment-options > div:not(:last-child) {
  margin-right: 16px;
}
.payment-solomon {
  display: flex;
  background-color: #141414;
  font-size: 15px;
  letter-spacing: 1.4px;
  height: 38px;
  width: 100%;
  text-transform: uppercase;
  border-radius: 4px;
  align-items: center;
  justify-content: center;
  color: white;
  margin-top: 8px;
}
.payment-solomon > img {
  height: 22px;
  margin-right: 8px;
}
.payment-paypal {
  background-color: #0079c1;
}
.payment-paypal > img {
  height: 20px;
  margin-top: 2px;
}
.payment-card {
  background-color: #1476f1;
  color: white;
}
.section-head {
  color: #908e8e;
  border-bottom: 1px solid #d8d8d8;
  padding-bottom: 8px;
  margin-top: 48px;
}
.head-line1 {
  letter-spacing: 0.65px;
  font-size: 17px;
  font-weight: 600;
}
.head-line2 {
  letter-spacing: 0.42px;
  font-size: 12px;
  font-weight: 500;
  margin-top: 2px;
  color: #b2b2b2;
}
@media (max-width: 600px) {
  .payment-options {
    padding: 0 8px;
  }
  .payment-solomon {
    font-size: 12px;
    letter-spacing: 1.2px;
  }
}
</style>
