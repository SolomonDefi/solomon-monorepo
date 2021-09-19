<template>
  <div class="page-wrap home">
    <div class="page container">
      <h1>{{ $t('home.title') }}</h1>
      <div class="section">
        {{ $t('home.intro') }}
      </div>
      <div class="section" v-html="$t('home.wallet')" />
      <div class="section">
        {{ $t('home.type') }}
      </div>
      <div class="types selection-wrap">
        <div
          class="type selection"
          :class="{ selected: type === 'buyer' }"
          @click="type = 'buyer'"
        >
          {{ $t('home.buyer') }}
        </div>
        <div
          class="type selection"
          :class="{ selected: type === 'merchant' }"
          @click="type = 'merchant'"
        >
          {{ $t('home.merchant') }}
        </div>
      </div>
      <div class="button" @click="$router.push({ name: 'select', params: { type } })">
        {{ $t('next') }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'home',
  setup() {
    const type = ref('buyer')
    return {
      type,
    }
  },
}
</script>

<style lang="postcss">
@import '@theme/css/global.css';

.home {
  .types {
    margin-top: 16px;
  }
  .type {
    @mixin medium 18px;
  }
  .button {
    margin-top: 24px;
    min-width: 160px;
  }
}
</style>
