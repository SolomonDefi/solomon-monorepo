class EnvStore {
  get isDev(): boolean {
    return process.env.NODE_ENV === 'development'
  }

  get isTest(): boolean {
    return process.env.NODE_ENV === 'test'
  }

  get ethereumNodeUrl(): string {
    return process.env.ETHEREUM_NODE_URL || ''
  }

  get factoryAddress(): string {
    return process.env.FACTORY_ADDRESS || ''
  }

  get mailgunApiKey(): string {
    return this.isDev ? 'key-1234123412341234' : ''
  }

  // one of your domain names listed at your https://app.mailgun.com/app/sending/domains
  get mailgunDomain(): string {
    return ''
  }
}

export default new EnvStore()
