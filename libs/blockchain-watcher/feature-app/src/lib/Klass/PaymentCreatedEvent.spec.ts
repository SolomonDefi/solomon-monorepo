import { PaymentCreatedEvent } from './PaymentCreatedEvent'
import { v4 } from 'uuid'
import _ from 'lodash'
import { EnumPaymentCreatedEventType } from '../Enum/EnumPaymentCreatedEventType'
import { stringHelper } from '@solomon/blockchain-watcher/feature-app'

describe('PaymentCreatedEvent', () => {
  it('constructor() with empty props', () => {
    let p = new PaymentCreatedEvent({})

    expect(p).toBeInstanceOf(PaymentCreatedEvent)
  })

  it('constructor() with valid props', () => {
    let id = v4()
    let addr1 = stringHelper.generateRandomEthAddr()
    let addr2 = stringHelper.generateRandomEthAddr()
    let addr3 = stringHelper.generateRandomEthAddr()
    let addr4 = stringHelper.generateRandomEthAddr()
    let addr5 = stringHelper.generateRandomEthAddr()

    let p = new PaymentCreatedEvent({
      id: id,
      type: EnumPaymentCreatedEventType.chargeback,
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
    expect(p.type).toEqual(EnumPaymentCreatedEventType.chargeback)
    expect(p.party1).toEqual(addr1)
    expect(p.party2).toEqual(addr2)
    expect(p.contract).toEqual(addr3)
    expect(p.judgeContract).toEqual(addr4)
    expect(p.token).toEqual(addr5)
    expect(p.discount).toEqual(50)
    expect(p.ethPaid).toEqual(0.1)
  })

  it('constructor() with invalid props', () => {
    let badId = new PaymentCreatedEvent({ id: '' })
    let badType = new PaymentCreatedEvent({ type: '' as any })
    let badParty1 = new PaymentCreatedEvent({ party1: '' })
    let badParty2 = new PaymentCreatedEvent({ party2: '' })
    let badContract = new PaymentCreatedEvent({ contract: '' })
    let badJudgeContract = new PaymentCreatedEvent({ judgeContract: '' })
    let badToken = new PaymentCreatedEvent({ token: '' })
    let badDiscount = new PaymentCreatedEvent({ discount: -1 })
    let badEthPaid = new PaymentCreatedEvent({ ethPaid: -1 })

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
    p.type = EnumPaymentCreatedEventType.chargeback
    p.party1 = stringHelper.generateRandomEthAddr()
    p.party2 = stringHelper.generateRandomEthAddr()
    p.contract = stringHelper.generateRandomEthAddr()
    p.judgeContract = stringHelper.generateRandomEthAddr()
    p.token = stringHelper.generateRandomEthAddr()
    p.discount = 0
    p.ethPaid = 1

    expect(p.isValid()).toEqual(true)
  })

  it('constructor() assign invalid props', () => {
    let p = new PaymentCreatedEvent({
      id: v4(),
      type: EnumPaymentCreatedEventType.chargeback,
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      token: stringHelper.generateRandomEthAddr(),
      discount: 50,
      ethPaid: 0.1,
    })
    let badP = _.cloneDeep(p)

    expect(badP.isValid()).toEqual(true)

    badP.id = ''
    expect(badP.isValid()).toEqual(false)

    badP = p
    badP.type = EnumPaymentCreatedEventType.unknown
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
