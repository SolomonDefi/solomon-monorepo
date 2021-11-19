import { stringHelper } from "../helper/stringHelper";

class EnvStore {
  get isTest(): boolean {
    return process.env.NODE_ENV === 'test'
  }

  get isDev(): boolean {
    return process.env.NODE_ENV === 'development'
  }

  get isStage(): boolean {
    return process.env.NODE_ENV === 'staging'
  }

  get isProd(): boolean {
    return process.env.NODE_ENV === 'production'
  }

  get envName() {
    return process.env.NODE_ENV || 'unknown'
  }

  get infuraId(): string {
    return process.env['INFURA_ID'] || ''
  }

  get ethNetworkUrl(): string {
    if (this.isTest) {
      return process.env['ETH_NETWORK_URL_TEST'] || 'http://localhost:8545'
    }

    if (this.isDev) {
      return process.env['ETH_NETWORK_URL_DEV'] || 'http://localhost:8545'
    }

    if (this.isStage) {
      return process.env['ETH_NETWORK_URL_STAGE'] || `https://ropsten.infura.io/v3/${this.infuraId}`
    }

    if (this.isProd) {
      return process.env['ETH_NETWORK_URL_PROD'] || `https://infura.io/v3/${this.infuraId}`
    }

    return ''
  }

  get contractAddress(): string {
    if(this.isTest) {
      return stringHelper.generateRandomEthAddr()
    }

    return process.env['CONTRACT_ADDRESS'] || ''
  }

  get walletPrivateKey(): string {
    if(this.isTest) {
      return stringHelper.generateRandomEthPrivateKey()
    }

    return process.env['WALLET_PRIVATE_KEY'] || ''
  }

  get mailgunApiKey(): string {
    if(this.isTest) {
      return 'foo'
    }

    return process.env['MAILGUN_API']
  }

  // one of your domain names listed at your https://app.mailgun.com/app/sending/domains
  get mailgunDomain(): string {
    return process.env['MAILGUN_DOMAIN']
  }

  get disputeApiUrl(): string {
    return process.env['DISPUTE_API_URL'] || ''
  }

  get disputeApiSecretKey(): string {
    return process.env['DISPUTE_API_SECRET_KEY'] || ''
  }
}

export const envStore = new EnvStore()
