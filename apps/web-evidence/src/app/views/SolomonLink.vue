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
          @click="router.push({ name: 'select', params: { type: $route.params.type } })"
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
import { useRouter } from 'vue-router'
import { FileUpload, ErrorMessage } from '@solomon/web/ui-widgets'
import {
  MediaRequirements,
  ValidatedFile,
  validateMedia,
} from '@solomon/web/util-validate'
import { useEvidenceApi } from '@solomon/web/data-access-api'
import { evidenceApi } from '../utils/config'

const { t } = useI18n()
const router = useRouter()
const api = useEvidenceApi(evidenceApi)

// const link = ref('')
const loading = ref(false)
const uploadError = ref()
const file = ref()

const fileName = computed(() => {
  return file.value?.file.name
})

const validateCallback = (validFile: ValidatedFile, errors: string[] | null) => {
  if (errors && errors.length) {
    uploadError.value = t(errors[0])
  } else {
    file.value = validFile
  }
}

const fileSelect = (file: File) => {
  const requirements: MediaRequirements = {
    ext: ['jpg', 'txt', 'jpeg', 'png', 'pdf', 'mp4', 'zip'],
    size: 20000000,
  }

  validateMedia(requirements, file, validateCallback)
}

const upload = async () => {
  if (loading.value) {
    return
  }
  if (file.value) {
    await api.uploadEvidenceFile(file.value)
  } else {
    uploadError.value = t('errors.FILE_REQUIRED')
  }
}
</script>

<style lang="postcss">
@import '@theme/css/defines.css';

.solomon-link {
  padding-bottom: 40px;
}
</style>
