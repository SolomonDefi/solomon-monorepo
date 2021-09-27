<template>
  <div class="page-wrap solomon-link">
    <div class="page container">
      <h1>{{ $t('upload.solomon') }}</h1>
      <div class="section">
        {{ $t('upload.solomon_text1') }}
      </div>
      <div class="section">
        {{ $t('upload.solomon_text2') }}
      </div>
      <FileUpload :currentFile="fileName" @file-select="fileSelect" />
      <ErrorMessage :errorMessage="uploadError" />
      <div class="buttons">
        <div
          class="button button-back"
          @click="$router.push({ name: 'select', params: { type: $route.params.type } })"
        >
          {{ $t('back') }}
        </div>
        <div class="button" @click="upload">
          {{ $t('submit') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

function validateFile(requirements, file) {
  const { ext, size } = requirements
  if (file.size > size) {
    return 'errors.FILE_SIZE_BIG'
  }
  if (!ext.includes(file.name.substr(file.name.length - 3))) {
    return 'errors.FILE_TYPE'
  }
  return null
}

const { t } = useI18n()
// const link = ref('')
const uploadError = ref(null)
const file = ref(null)

const fileSelect = (f) => {
  const requirements = {
    ext: ['jpg', 'txt', 'jpeg', 'png', 'pdf', 'mp4', 'zip'],
    size: 20000000,
  }
  const error = validateFile(requirements, f)
  if (error) {
    uploadError.value = t(error)
  } else {
    file.value = f
  }
}
const upload = () => {
  if (file.value) {
    uploadError.value = t('errors.FILE_REQUIRED')
  } else {
    uploadError.value = t('upload.unavailable')
  }
}
</script>

<style lang="postcss">
@import '@theme/css/defines.css';

.solomon-link {
  .button {
    margin-top: 24px;
    min-width: 160px;
    &:not(:first-child) {
      margin-left: 24px;
    }
  }
  padding-bottom: 40px;
}
</style>
