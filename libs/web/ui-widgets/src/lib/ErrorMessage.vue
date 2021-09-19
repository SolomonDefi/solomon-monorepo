<template>
  <div class="error-message-wrap">
    <transition name="animate-height" appear>
      <div v-if="errorMessage" class="error-message">
        <div class="error">
          <Info color="#f46a6a" class="error-icon" />
          <span>{{ errorMessage }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'error-message',
  props: {
    errorMessage: {
      type: String,
      default: null,
    },
  },
}
</script>

<style lang="postcss">
@import '@theme/css/global.css';

.error-message-wrap {
  width: 100%;

  .error {
    margin-top: 0;
    margin-bottom: 0;
    @mixin medium 13px;
    color: $red;
    padding-top: 12px;
    @mixin flex-center;
    justify-content: flex-start;
  }
  .error-icon {
    margin-right: 8px;
    flex-shrink: 0;
  }
  .error-message {
    max-height: 100px;
    opacity: 1;
    transition: all 0.3s;
  }
  .animate-height-enter,
  .animate-height-leave-to {
    max-height: 0;
    opacity: 0;
  }
}
</style>
