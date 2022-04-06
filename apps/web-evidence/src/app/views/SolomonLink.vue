<template>
  <div class="page-wrap solomon-link">
    <div class="page container">
      <h1>{{ t('upload.solomon') }}</h1>
      <div class="section">
        {{ t('upload.solomon_text1') }}
      </div>
      <div class="section">
        {{ t('upload.solomon_text2') }}
      </div>
      <FileUpload :currentFile="fileName" @file-select="fileSelect" />
      <ErrorMessage :errorMessage="uploadError" />
      <div class="buttons">
        <div
          class="button button-back"
          @click="$router.push({ name: 'select', params: { type: $route.params.type } })"
        >
          {{ t('back') }}
        </div>
        <div class="button" @click="upload">
          {{ t('submit') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { FileUpload, ErrorMessage } from '@solomon/web/ui-widgets'

export interface MediaRequirements {
  width?: number
  height?: number
  ext?: string[]
  size?: number
}

const { t } = useI18n()

function validateFile(requirements: MediaRequirements, file: File) {
  const { ext, size } = requirements
  const reqSize = size ?? 0

  if (file.size > reqSize) {
    return 'errors.FILE_SIZE_BIG'
  }
  const fileExt = file.name.split('.').pop()
  if (ext && (!fileExt || !ext.includes(fileExt))) {
    return 'errors.FILE_TYPE'
  }
  return null
}

// const link = ref('')
const uploadError = ref()
const file = ref()

const fileName = computed(() => {
  return file.value?.name
})

const fileSelect = (f: File) => {
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
  padding-bottom: 40px;
}
</style>
