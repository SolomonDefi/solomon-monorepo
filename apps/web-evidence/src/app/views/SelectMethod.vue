<template>
  <div class="page-wrap select-method">
    <div class="page container">
      <h1>{{ $t('select.title') }}</h1>
      <div class="methods selection-wrap">
        <div
          class="method selection"
          :class="{ selected: method === 'upload-external' }"
          @click="select('upload-external')"
        >
          <div class="method-title">
            {{ $t('select.external') }}
          </div>
          <div class="method-text">
            {{ $t('select.external_text') }}
          </div>
        </div>
        <div
          class="method selection"
          :class="{ selected: method === 'upload-solomon' }"
          @click="select('upload-solomon')"
        >
          <div class="method-title">
            {{ $t('select.solomon') }}
          </div>
          <div class="method-text">
            {{ $t('select.solomon_text') }}
          </div>
        </div>
      </div>
      <div class="buttons">
        <div class="button button-back" @click="$router.push({ name: 'home' })">
          {{ $t('back') }}
        </div>
        <div class="button" @click="goMethod">
          {{ $t('next') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'select-method',
  setup() {
    const { t } = useI18n()
    const router = useRouter()
    const route = useRoute()
    const method = ref('upload-external')

    const goMethod = () => {
      router.push({ name: method.value, params: { type: route.params.type } })
    }
    const select = (newMethod) => {
      method.value = newMethod
    }
    return {
      method,
      select,
      goMethod,
    }
  },
}
</script>

<style lang="postcss">
@import '@theme/css/global.css';

.select-method {
  .methods {
    margin-top: 40px;
  }
  .method {
    max-width: 300px;
    justify-content: flex-start;
  }
  .method-title {
    @mixin semibold 15px;
  }
  .method-text {
    @mixin text 14px;
    margin-top: 8px;
  }
  .button {
    margin-top: 24px;
    min-width: 160px;
    &:not(:first-child) {
      margin-left: 24px;
    }
  }
}
</style>
