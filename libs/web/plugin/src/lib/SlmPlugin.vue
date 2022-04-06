<template>
  <transition name="modal">
    <div v-if="show" class="slm-plugin-modal">
      <div class="slm-plugin-mask" @click="emit('cancel')" />
      <div class="slm-plugin-wrap">
        <div class="slm-plugin">
          <div class="slm-plugin-title">
            {{ ts('title') }}
          </div>
          <SlmPluginTypes
            v-model:pluginType="pluginType"
            :availableTypes="availableTypes"
          />
          <div class="slm-plugin-content-wrap">
            <transition name="plugin-content" mode="out-in">
              <SlmPluginChargebacks
                v-if="pluginType.name === 'chargebacks'"
                :prices="prices"
              />
              <SlmPluginPreorder
                v-else-if="pluginType.name === 'preorder'"
                :prices="prices"
              />
              <SlmPluginEscrow
                v-else-if="pluginType.name === 'escrow'"
                :prices="prices"
              />
            </transition>
            <div class="slm-plugin-secure">
              <img :src="IcLock" />
              <div>{{ ts('secure') }}</div>
            </div>
            <div class="slm-plugin-buttons">
              <div class="slm-plugin-continue" @click="emit('cancel')">
                {{ ts('continue') }}
              </div>
              <div class="slm-plugin-confirm">
                {{ ts('confirm') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import {
  computed,
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  toRefs,
  onUpdated,
  reactive,
} from 'vue'
import { allPlugins, pluginTypes as defaultPluginTypes } from './defaults'
import { ts } from './i18n'
import IcLock from '../assets/img/ic_lock.png'
import SlmPluginTypes from './SlmPluginTypes.vue'
import SlmPluginChargebacks from './SlmPluginChargebacks.vue'
import SlmPluginPreorder from './SlmPluginPreorder.vue'
import SlmPluginEscrow from './SlmPluginEscrow.vue'

const emit = defineEmits(['cancel'])

const props = defineProps({
  show: Boolean,
  initialType: {
    validator: (value: string) => allPlugins.includes(value),
    default: 'solomon',
  },
  availableTypes: {
    validator: (value) =>
      value === null ||
      (Array.isArray(value) && value.every((v) => allPlugins.includes(v))),
    default: [],
  },
  store: {
    type: Object,
    default: undefined,
  },
  priceUsdCents: {
    type: Number,
    default: 0,
  },
})
const { initialType, availableTypes, store, priceUsdCents } = toRefs(props)

const pluginTypes = reactive(defaultPluginTypes)

const pluginType = ref(
  pluginTypes[initialType.value || (availableTypes.value || allPlugins)[0]],
)
const priceCents = computed(() =>
  store.value ? store.value.totalPrice : priceUsdCents.value,
)
const priceSlm = computed(() => priceCents.value * 0.001848)
const priceEth = computed(() => priceCents.value * 0.0000084)
const prices = computed(() => ({
  priceUsd: priceCents.value,
  priceSlm: priceSlm.value,
  priceEth: priceEth.value,
}))
watch(initialType, (newVal: string) => {
  pluginType.value = pluginTypes[newVal]
})
const escapeListener = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('cancel')
  }
}

onUpdated(() => {
  for (const name of allPlugins) {
    const type = pluginTypes[name]
    const el = document.getElementById(type.selectId)
    if (el) {
      type.arrowPosition = `${el.offsetLeft + (el.offsetWidth - 20) / 2}px`
    }
  }
})
onMounted(() => {
  window.addEventListener('keyup', escapeListener)
})
onBeforeUnmount(() => {
  window.removeEventListener('keyup', escapeListener)
})
</script>

<style lang="postcss">
@import '@theme/css/global.css';

/* Variables for clients to override */
:root {
  --solomon-color-text-dark: $text-main;
  --solomon-color-text-form: $grey4;
  --solomon-color-text-disabled: $disabled1;
}

.slm-plugin-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100%;
  max-height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-bottom: 40px;
  .slm-plugin-mask {
    background: rgba(0, 0, 0, 0.8);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .slm-plugin-wrap {
    position: relative;
    width: 480px;
    background: white;
    display: flex;
    border-radius: 4px;
    margin-top: 5%;
    max-height: 90%;
    overflow-y: scroll;
    box-shadow: 0 2px 15px 12px rgba(150, 150, 150, 0.2);
  }
  .slm-plugin {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .slm-plugin-title {
    @mixin flex-center;
    @mixin title 24px;
    height: 80px;
    min-height: 80px;
    border-bottom: 1px solid #eee;
    color: $grey4;
  }
  .plugin-content-enter-active,
  .plugin-content-leave-active {
    transition: opacity 0.35s ease;
  }

  .plugin-content-enter-from,
  .plugin-content-leave-to {
    opacity: 0;
  }
  .slm-plugin-content-wrap {
    background-color: $grey4;
  }
  .slm-plugin-content-title {
    @mixin text 17px;
    @mixin flex-center;
    color: $bg1;
    height: 96px;
  }
  .slm-plugin-content {
    @mixin flex-center-col;
    width: 340px;
    margin: 0 auto;
    background-color: white;
    border-radius: 4px;
    padding: 16px 16px 24px 8px;

    .slm-plugin-content-row {
      display: flex;
      width: 100%;
      &:not(:first-child) {
        margin-top: 9px;
      }
    }
    .slm-plugin-select-title {
      @mixin flex-center;
      @mixin title 12px;
      justify-content: flex-end;
      color: $grey4;
      height: 34px;
      width: 120px;
      margin-right: 8px;
    }
    .slm-plugin-row-right {
      @mixin flex-center;
      @mixin title-medium 15px;
      justify-content: flex-start;
      flex-grow: 1;
    }
    .slm-plugin-price {
      @mixin select;
      color: var(--solomon-color-text-dark);
      flex-grow: 1;
      position: relative;
      justify-content: flex-start;
      .slm-plugin-currency {
        @mixin title 13px;
        color: $disabled1;
        position: absolute;
        right: 8px;
        top: 10px;
      }
    }
    .slm-plugin-month,
    .slm-plugin-year {
      margin-right: 6px;
    }
    .slm-plugin-year {
      flex-grow: 1;
    }
  }
  .slm-plugin-secure {
    @mixin text 13px;
    @mixin flex-center;
    color: $bg1;
    margin: 32px 0;
    img {
      height: 18px;
      margin-right: 8px;
    }
  }
  .slm-plugin-buttons {
    @mixin flex-center;
    height: 96px;
    background: white;
    > div {
      @mixin flex-center;
      height: 34px;
      @mixin title 10px;
      letter-spacing: 1.7px;
      padding: 0 24px;
      border-radius: 17px;
      cursor: pointer;
    }
    .slm-plugin-continue {
      color: $grey4;
      border: 1px solid $border1;
      margin-right: 16px;
    }
    .slm-plugin-confirm {
      background-color: $purple;
      color: white;
    }
  }
  @media (max-width: 600px) {
    padding-left: 16px;
    padding-right: 16px;
    .slm-plugin-types {
      font-size: 10px;
      > div {
        width: min-content;
      }
    }
    .slm-plugin-content {
      width: 100%;
    }
    .slm-plugin-buttons > div {
      padding: 0 12px;
    }
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s linear;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .slm-plugin-wrap,
.modal-leave-active .slm-plugin-wrap {
  transition: transform 0.3s cubic-bezier(0.5, 0, 0.5, 1), opacity 0.3s linear;
}
.modal-enter-from .slm-plugin-wrap,
.modal-leave-to .slm-plugin-wrap {
  opacity: 0;
  transform: scale(0.7) translateY(-10%);
}
</style>
