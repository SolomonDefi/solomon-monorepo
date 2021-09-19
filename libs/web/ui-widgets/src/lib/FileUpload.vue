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
          <h4>{{ $t('upload.drag_drop') }}</h4>
          <div>{{ $t('upload.browse_file') }}</div>
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

<script>
import { ref } from 'vue'

export default {
  emits: ['file-select'],
  props: {
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
  },
  setup(_, { emit }) {
    const dragging = ref(false)

    const handleFileSelect = (e) => {
      if (e.type === 'input') {
        const file = e.target.files[0]
        emit('file-select', file)
      } else if (e.type === 'drop') {
        const file = e.dataTransfer.files[0]
        emit('file-select', file)
      }
      dragging.value = false
    }
    const dragStart = (e) => {
      e.preventDefault()
      dragging.value = true
    }
    const dragEnd = (e) => {
      e.preventDefault()
      dragging.value = false
    }
    const dropFile = (e) => {
      e.preventDefault()
      handleFileSelect(e)
    }
    return {
      dragging,
      handleFileSelect,
      dragStart,
      dragEnd,
      dropFile,
    }
  },
}
</script>

<style lang="postcss">
@import '@theme/css/global.css';

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
