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
    return ''
  }

  get ethChainUrl(): string {
    if(this.isDev) {
      return 'http://localhost:8545'
    }

    if(this.isStage) {
      return `https://ropsten.infura.io/v3/${this.infuraId}`
    }

    if(this.isProd) {
      return `https://infura.io/v3/${this.infuraId}`
    }

    return ''
  }

  get factoryAddress(): string {
    return process.env.FACTORY_ADDRESS || ''
  }

  get mailgunApiKey(): string {
    return ''
  }

  // one of your domain names listed at your https://app.mailgun.com/app/sending/domains
  get mailgunDomain(): string {
    return ''
  }
}

export default new EnvStore()
