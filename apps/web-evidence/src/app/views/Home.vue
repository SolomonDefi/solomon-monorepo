<template>
  <div class="page-wrap home">
    <div class="page container">
      <h1>{{ t('home.title') }}</h1>
      <div class="section">
        {{ t('home.intro') }}
      </div>
      <div class="section" v-html="t('home.wallet')" />
      <div class="section">
        {{ t('home.type') }}
      </div>
      <div class="types selection-wrap">
        <div
          class="type selection"
          :class="{ selected: type === 'buyer' }"
          @click="type = 'buyer'"
        >
          {{ t('home.buyer') }}
        </div>
        <div
          class="type selection"
          :class="{ selected: type === 'merchant' }"
          @click="type = 'merchant'"
        >
          {{ t('home.merchant') }}
        </div>
      </div>
      <div class="button" @click="$router.push({ name: 'select', params: { type } })">
        {{ t('next') }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const type = ref('buyer')
</script>

<style lang="postcss">
@import '@theme/css/defines.css';

.home {
  .types {
    margin-top: 16px;
  }
  .type {
    @mixin medium 18px;
  }
}
</style>
