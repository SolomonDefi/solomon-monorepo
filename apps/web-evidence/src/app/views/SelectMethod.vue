<template>
  <div class="page-wrap select-method">
    <div class="page container">
      <h1>{{ t('select.title') }}</h1>
      <div class="methods selection-wrap">
        <div
          class="method selection"
          :class="{ selected: method === EvidenceMethod.UploadExternal }"
          @click="select(EvidenceMethod.UploadExternal)"
        >
          <div class="method-title">
            {{ t('select.external') }}
          </div>
          <div class="method-text">
            {{ t('select.external_text') }}
          </div>
        </div>
        <div
          class="method selection"
          :class="{ selected: method === EvidenceMethod.UploadSolomon }"
          @click="select(EvidenceMethod.UploadSolomon)"
        >
          <div class="method-title">
            {{ t('select.solomon') }}
          </div>
          <div class="method-text">
            {{ t('select.solomon_text') }}
          </div>
        </div>
      </div>
      <div class="buttons">
        <div class="button button-back" @click="$router.push({ name: 'home' })">
          {{ t('back') }}
        </div>
        <div class="button" @click="goMethod">
          {{ t('next') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'

enum EvidenceMethod {
  UploadExternal = 'upload-external',
  UploadSolomon = 'upload-solomon',
}

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const method = ref(EvidenceMethod.UploadExternal)

const goMethod = () => {
  router.push({ name: method.value, params: { type: route.params.type } })
}
const select = (newMethod: EvidenceMethod) => {
  method.value = newMethod
}
</script>

<style lang="postcss">
@import '@theme/css/defines.css';

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
}
</style>
