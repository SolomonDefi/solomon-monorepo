import ContractWatcher from './ContractWatcher';

describe('ContractWatcher', () => {
  test('constructor()', async () => {
    let watcher = new ContractWatcher({})

    expect(watcher).toBeInstanceOf(ContractWatcher)
  })
})
