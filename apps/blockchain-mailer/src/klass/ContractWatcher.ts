export default class ContractWatcher {

  id: string = null as any
  address: string = null as any
  topics: string[] = []

  callback: (log: any, event: any) => Promise<void> = async () => {

  }

  constructor(props: Partial<ContractWatcher>) {
    Object.assign(this, props)
  }

}
