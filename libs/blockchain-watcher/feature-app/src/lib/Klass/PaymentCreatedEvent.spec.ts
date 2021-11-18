import { PaymentCreatedEvent } from './PaymentCreatedEvent'
import { v4 } from 'uuid'
import _ from 'lodash'
import { PaymentCreatedEventType } from '../Enum/PaymentCreatedEventType'
import { ethers } from 'ethers'

describe('PaymentCreatedEvent', () => {
  it('constructor() with empty props', () => {
    let p = new PaymentCreatedEvent({})

    expect(p).toBeInstanceOf(PaymentCreatedEvent)
  })

  it('constructor() with valid props', () => {
    const id = v4()
    const addr1 = ethers.Wallet.createRandom().address
    const addr2 = ethers.Wallet.createRandom().address
    const addr3 = ethers.Wallet.createRandom().address
    const addr4 = ethers.Wallet.createRandom().address
    const addr5 = ethers.Wallet.createRandom().address

    let p = new PaymentCreatedEvent({
      id: id,
      type: PaymentCreatedEventType.chargeback,
      party1: addr1,
      party2: addr2,
      contract: addr3,
      judgeContract: addr4,
      token: addr5,
      discount: 50,
      ethPaid: 0.1,
    })

    expect(p.isValid()).toEqual(true)
    expect(p.id).toEqual(id)
    expect(p.type).toEqual(PaymentCreatedEventType.chargeback)
    expect(p.party1).toEqual(addr1)
    expect(p.party2).toEqual(addr2)
    expect(p.contract).toEqual(addr3)
    expect(p.judgeContract).toEqual(addr4)
    expect(p.token).toEqual(addr5)
    expect(p.discount).toEqual(50)
    expect(p.ethPaid).toEqual(0.1)
  })

  it('constructor() with invalid props', () => {
    const badId = new PaymentCreatedEvent({ id: '' })
    const badType = new PaymentCreatedEvent({ type: '' as any })
    const badParty1 = new PaymentCreatedEvent({ party1: '' })
    const badParty2 = new PaymentCreatedEvent({ party2: '' })
    const badContract = new PaymentCreatedEvent({ contract: '' })
    const badJudgeContract = new PaymentCreatedEvent({ judgeContract: '' })
    const badToken = new PaymentCreatedEvent({ token: '' })
    const badDiscount = new PaymentCreatedEvent({ discount: -1 })
    const badEthPaid = new PaymentCreatedEvent({ ethPaid: -1 })

    expect(badId.isValid()).toEqual(false)
    expect(badType.isValid()).toEqual(false)
    expect(badParty1.isValid()).toEqual(false)
    expect(badParty2.isValid()).toEqual(false)
    expect(badContract.isValid()).toEqual(false)
    expect(badJudgeContract.isValid()).toEqual(false)
    expect(badToken.isValid()).toEqual(false)
    expect(badDiscount.isValid()).toEqual(false)
    expect(badEthPaid.isValid()).toEqual(false)
  })

  it('constructor() assign valid props', () => {
    let p = new PaymentCreatedEvent({})

    p.id = v4()
    p.type = PaymentCreatedEventType.chargeback
    p.party1 = ethers.Wallet.createRandom().address
    p.party2 = ethers.Wallet.createRandom().address
    p.contract = ethers.Wallet.createRandom().address
    p.judgeContract = ethers.Wallet.createRandom().address
    p.token = ethers.Wallet.createRandom().address
    p.discount = 0
    p.ethPaid = 1

    expect(p.isValid()).toEqual(true)
  })

  it('constructor() assign invalid props', () => {
    const p = new PaymentCreatedEvent({
      id: v4(),
      type: PaymentCreatedEventType.chargeback,
      party1: ethers.Wallet.createRandom().address,
      party2: ethers.Wallet.createRandom().address,
      contract: ethers.Wallet.createRandom().address,
      judgeContract: ethers.Wallet.createRandom().address,
      token: ethers.Wallet.createRandom().address,
      discount: 50,
      ethPaid: 0.1,
    })
    let badP = _.cloneDeep(p)

    expect(badP.isValid()).toEqual(true)

    badP.id = ''
    expect(badP.isValid()).toEqual(false)

    badP = p
    badP.type = PaymentCreatedEventType.unknown
    expect(badP.isValid()).toEqual(false)

    badP = p
    badP.party1 = ''
    expect(badP.isValid()).toEqual(false)

    badP = p
    badP.party2 = ''
    expect(badP.isValid()).toEqual(false)

    badP = p
    badP.contract = ''
    expect(badP.isValid()).toEqual(false)

    badP = p
    badP.judgeContract = ''
    expect(badP.isValid()).toEqual(false)

    badP = p
    badP.token = ''
    expect(badP.isValid()).toEqual(false)

    badP = p
    badP.discount = 101
    expect(badP.isValid()).toEqual(false)

    badP = p
    badP.discount = -1
    expect(badP.isValid()).toEqual(false)

    badP = p
    badP.ethPaid = -1
    expect(badP.isValid()).toEqual(false)
  })
})
