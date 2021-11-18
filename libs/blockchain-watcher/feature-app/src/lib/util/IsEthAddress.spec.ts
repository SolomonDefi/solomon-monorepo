import { IsEthAddress } from './IsEthAddress'
import { validateSync } from 'class-validator'
import { ethers } from 'ethers'

describe('IsEthAddress decorator', () => {
  it('with valid prop', async () => {
    class C1 {
      @IsEthAddress()
      addr = ethers.Wallet.createRandom().address
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
