
class EnvStore {

  get isDev() {
    return process.env.NODE_ENV === "development"
  }

  get ethereumNodeUrl() {
    return process.env.ETHEREUM_NODE_URL
  }

  get factoryAddress() {
    return process.env.FACTORY_ADDRESS
  }

}

export default new EnvStore()
