<template>
  <div class="app-wrap">
    <SlmHeader />
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style lang="postcss">
@import '@theme/css/font.css';
@import '@theme/css/global.css';

html,
body {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  color: white;
  background-color: black;
  * {
    box-sizing: border-box;
  }
}

a {
  text-decoration: none;
  color: $blue;
}

#app,
.app-wrap {
  height: 100%;
}
.app-wrap {
  display: flex;
  flex-direction: column;
}

h1 {
  @mixin title 28px;
}

.button {
  background-color: $blue;
  color: white;
  @mixin semibold 16px;
  border-radius: 4px;
  @mixin flex-center;
  display: inline-flex;
  height: 44px;
  padding: 0 24px;
  cursor: pointer;
}
.button-back {
  background-color: $dark3;
}

.section {
  @mixin text 16px;
  margin-top: 24px;
  line-height: 24px;
  max-width: 600px;
}

.page-wrap {
  background-color: $dark1;
  display: flex;
  flex-direction: column;
  flex: 1;
  .page {
    padding-top: 64px;
  }
}

.selection-wrap {
  display: flex;
}
.selection {
  border: 1px solid $grey2;
  border-radius: 5px;
  padding: 24px;
  cursor: pointer;
  @mixin flex-center;
  flex-direction: column;
  transition: all 0.3s ease;
  min-width: 160px;
  &:hover {
    box-shadow: 0 0 14px rgba(255, 255, 255, 0.4);
  }
  &.selected {
    background-color: $grey2;
    color: $dark1;
  }
  &:not(:last-child) {
    margin-right: 16px;
  }
}

.container {
  max-width: 1000px;
  box-sizing: border-box;
  padding-left: 40px;
  padding-right: 40px;
  margin: 0 auto;
}
@media (max-width: 900px) {
  .container {
    padding-left: 20px;
    padding-right: 20px;
  }
}
@media (max-width: 640px) {
  .page-wrap {
    height: 100%;
    padding-bottom: 40px;
  }
  .selection-wrap {
    flex-direction: column;
  }
  .selection:not(:last-child) {
    margin-right: 0;
    margin-bottom: 16px;
  }
}
</style>
