<template>
  <div class="page-wrap contract-submit">
    <div class="page container">
      <h1>{{ t('contract.title') }}</h1>
      <div class="section">
        {{ t('contract.text1') }}
      </div>
      <div class="section">
        {{ t('contract.text2') }}
      </div>
      <ErrorMessage v-if="connectError" :errorMessage="t(connectError)" />
      <div class="connect">
        <div v-if="!loadingAccount" class="button" @click="connectOrDisconnect">
          {{ walletConnected ? t('disconnect') : t('connect') }}
        </div>
      </div>
      <div class="buttons">
        <div
          class="button button-back"
          @click="$router.push({ name: 'select', params: { type: $route.params.type } })"
        >
          {{ t('back') }}
        </div>
        <div v-if="walletConnected" class="button" @click="submit">
          {{ t('next') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useChain } from '@samatech/vue3-eth'
import { ErrorMessage } from '@solomon/web/ui-widgets'

const { t } = useI18n()
const {
  walletConnected,
  loadingAccount,
  wrongNetwork,
  connectError,
  connectWallet,
  disconnectWallet,
} = useChain()

const connectOrDisconnect = () => {
  if (walletConnected.value) {
    disconnectWallet()
  } else {
    connectWallet('metamask')
  }
}

const submit = () => {}
</script>

<style lang="postcss">
.contract-submit {
  .connect {
    min-height: 80px;
  }
}
</style>
