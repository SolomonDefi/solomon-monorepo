import { stringHelper } from '@solomon/blockchain-watcher/feature-app'
import { IsEthAddress } from './IsEthAddress'
import { validateSync } from 'class-validator'

describe('IsEthAddress decorator', () => {
  it('with valid prop', async () => {
    class C1 {
      @IsEthAddress()
      addr = stringHelper.generateRandomEthAddr()
    }

    let c1 = new C1()

    expect(validateSync(c1).length).toEqual(0)
  })

  it('with invalid prop', async () => {
    class C1 {
      @IsEthAddress()
      addr = 'foo'
    }

    let c1 = new C1()

    expect(validateSync(c1).length).toEqual(1)
  })
})
