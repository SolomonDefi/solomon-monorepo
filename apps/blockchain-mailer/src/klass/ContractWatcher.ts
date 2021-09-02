
export default class ContractWatcher {

    id: string = null
    address: string = null
    topics: string[] = []
    callback: (log: any, event: any)=> Promise<void>

    constructor(props: Partial<ContractWatcher>) {
        Object.assign(this, props)
    }
}
