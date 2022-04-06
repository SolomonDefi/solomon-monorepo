<template>
  <div class="header-wrap">
    <div class="header container">
      <div class="header-left">
        <img src="../../../assets/img/ic_logo.png" />
        <div class="header-left-text">
          {{ $t('header.title') }}
        </div>
      </div>
      <div class="header-right">
        <div class="header-link"></div>
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
@import '@theme/css/defines.css';

.header-wrap {
  display: flex;
  width: 100%;
  height: 80px;
  background-color: rgba(0, 0, 0, 0.5);
}
.header {
  color: white;
  @mixin flex-center;
  height: 100%;
  width: 100%;
  .header-left {
    display: flex;
    align-items: center;
    pointer-events: none;

    img {
      width: 36px;
      height: 36px;
    }
    .header-left-text {
      @mixin medium 14px;
      letter-spacing: 0.7px;
      margin-left: 12px;
    }
  }
  .header-right {
    margin-left: auto;
    display: flex;
    align-items: center;
  }
}
</style>
