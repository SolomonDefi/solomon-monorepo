<template>
  <div :class="{ 'file-upload-wrap': true, dragging }">
    <form
      :id="id"
      class="file-upload-form"
      action=""
      enctype="multipart/form-data"
      @drop="dropFile"
      @dragenter="dragStart"
      @dragleave="dragEnd"
      @dragend="dragEnd"
      @input="handleFileSelect"
    >
      <label class="file-upload-area" :for="`image-upload-input${id}`">
        <div v-if="currentFile" class="file-upload-current">
          {{ currentFile }}
        </div>
        <div v-else class="file-upload-button">
          <Upload color="#277cea" />
          <h4>{{ t('upload.drag_drop') }}</h4>
          <div>{{ t('upload.browse_file') }}</div>
        </div>
      </label>
      <input
        :id="`file-upload-input${id}`"
        class="file-upload"
        type="file"
        accept="image/*"
        :disabled="isDisabled"
      />
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Upload from '../svg/Upload.vue'

const { t } = useI18n()

const emit = defineEmits(['file-select'])
defineProps({
  id: {
    type: String,
    default: 'file-upload',
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  currentFile: {
    type: String,
    default: null,
  },
})
const dragging = ref(false)

const handleFileSelect = (e: InputEvent | Event) => {
  if (e && e.target && e.type === 'input') {
    const files = (e.target as HTMLInputElement).files
    if (files) {
      emit('file-select', files[0])
    }
  } else if (e && e.type === 'drop') {
    const files = (e as InputEvent).dataTransfer?.files
    if (files) {
      emit('file-select', files[0])
    }
  }
  dragging.value = false
}
const dragStart = (e: Event) => {
  e.preventDefault()
  dragging.value = true
}
const dragEnd = (e: Event) => {
  e.preventDefault()
  dragging.value = false
}
const dropFile = (e: Event) => {
  e.preventDefault()
  handleFileSelect(e)
}
</script>

<style lang="postcss">
@import '@theme/css/defines.css';

.file-upload-wrap {
  border: 1px dashed $grey2;
  height: 180px;
  margin-top: 16px;
  @mixin medium 15px;
  &.dragging {
    border-color: $blue;
  }
}
.file-upload-form {
  position: relative;
  height: 100%;
  width: 100%;
}
.file-upload-background {
  position: absolute;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}
.file-upload {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  cursor: pointer;
}
.file-upload + label * {
  pointer-events: none;
}
.file-upload-button {
  @mixin flex-center;
  flex-direction: column;
  pointer-events: none;
  z-index: 10;
  background: rgba(255, 255, 255, 0.03);
  position: absolute;
  width: 100%;
  height: 100%;

  h4 {
    margin-top: 16px;
  }

  div {
    color: $blue;
    margin-top: 8px;
  }
}
.file-upload-current {
  @mixin flex-center;
  font-size: 16px;
  padding: 0 32px;
  height: 100%;
}
</style>
