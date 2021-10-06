<template>
  <transition name="modal">
    <div v-if="show" class="slm-plugin-modal">
      <div class="slm-plugin-mask" @click="$emit('cancel')" />
      <div class="slm-plugin-wrap">
        <div class="slm-plugin">
          <div class="slm-plugin-title">
            {{ ts('title') }}
          </div>
          <div class="slm-plugin-types-wrap">
            <div class="slm-plugin-types">
              <div
                v-for="plugin in plugins"
                :id="pluginTypes[plugin].selectId"
                :key="plugin"
                :class="{ active: pluginType.name === plugin }"
                @click="selectType(pluginTypes[plugin])"
              >
                {{ ts(`${plugin}.label`) }}
              </div>
            </div>
            <div
              class="slm-plugin-types-arrow"
              :style="{ left: pluginType.arrowPosition }"
            />
          </div>
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
              <div class="slm-plugin-continue" @click="$emit('cancel')">
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
import { computed, ref, watch, onMounted, onBeforeUnmount, toRefs, onUpdated } from 'vue'
import { allPlugins } from './defaults'
import { ts } from './i18n'

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
    default: null,
  },
  store: {
    type: Object,
    default: null,
  },
  priceUsdCents: {
    type: Number,
    default: 0,
  },
})
const { initialType, availableTypes, store, priceUsdCents } = toRefs(props)

interface PluginType {
  name: string
  selectId: string
  arrowPosition: string
}

const pluginTypes: Record<string, PluginType> = {
  chargebacks: {
    name: 'chargebacks',
    selectId: 'chargebacks-select',
    arrowPosition: '140px',
  },
  preorder: {
    name: 'preorder',
    selectId: 'preorder-select',
    arrowPosition: '208px',
  },
  escrow: {
    name: 'escrow',
    selectId: 'escrow-select',
    arrowPosition: '326px',
  },
}
const pluginType = ref(
  pluginTypes[initialType.value || (availableTypes.value || allPlugins)[0]],
)
const plugins = computed(() => availableTypes.value || allPlugins)
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
const selectType = (newType: PluginType) => {
  pluginType.value = newType
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
  .slm-plugin-types-wrap {
    position: relative;
  }
  .slm-plugin-types {
    @mixin flex-center;
    @mixin title 11px;
    color: $bg1;
    letter-spacing: 2px;
    height: 56px;
    > div {
      @mixin flex-center;
      padding: 0 16px;
      cursor: pointer;
      border-radius: 14px;
      height: 28px;
      &.active {
        background-color: $purple;
        color: white;
      }
      &:not(:last-child) {
        margin-right: 8px;
      }
    }
  }
  .slm-plugin-types-arrow {
    width: 0;
    height: 0;
    bottom: -1px;
    position: absolute;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 10px solid $grey4;
    transition: left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .slm-plugin-type {
    height: 48px;
    display: flex;
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
    transition: height 0.3s;
  }
  .slm-plugin-content-title {
    @mixin text 17px;
    @mixin flex-center;
    color: $bg1;
    height: 96px;
  }
  .slm-plugin-content {
    width: 340px;
    height: 184px;
    margin: 0 auto;
    @mixin flex-center-col;
    background-color: white;
    border-radius: 4px;
    padding: 32px 16px 32px 8px;
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
      color: $grey4;
      justify-content: flex-start;
      flex-grow: 1;
    }
    .slm-plugin-price {
      @mixin select;
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
