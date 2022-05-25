import {
  DisputeCompleteEventDto,
  DisputeCreatedEventDto,
  EvidenceSubmittedEventDto,
  PaymentCreatedEventDto,
} from '@solomon/shared/util-klass'
import { stringHelper } from '@solomon/shared/util-helper'
import { EnumEventType } from '@solomon/shared/util-enum'
import { v4 } from 'uuid'
import _ from 'lodash'
import { dbService } from './dbService'
import { eventDbService, EventDbService } from './eventDbService'

describe('eventDbService', () => {
  beforeAll(async () => {
    await dbService.init()
  })

  beforeEach(async () => {
    await dbService.resetForTest()
  })

  afterAll(async () => {
    await dbService.close(true)
  })

  test('constructor()', () => {
    expect(eventDbService).toBeInstanceOf(EventDbService)
  })

  test('saveEvent()', async () => {
    const dto1 = new DisputeCompleteEventDto({
      id: v4(),
      type: EnumEventType.preorderDisputeComplete,
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      awardedTo: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
    })
    const dto2 = new DisputeCreatedEventDto({
      id: v4(),
      type: EnumEventType.preorderDisputeCreated,
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
    })
    const dto3 = new EvidenceSubmittedEventDto({
      id: v4(),
      type: EnumEventType.preorderEvidenceSubmitted,
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      evidenceUrl: 'foo@b.ar',
      submitter: stringHelper.generateRandomEthAddr(),
    })
    const dto4 = new PaymentCreatedEventDto({
      id: v4(),
      type: EnumEventType.preorderPaymentCreated,
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      discount: 0,
      token: stringHelper.generateRandomEthAddr(),
      ethPaid: '0.01',
    })

    await eventDbService.saveEvent([dto1, dto2, dto3, dto4])

    const res = await dbService.eventRepository.findAll()
    const r1 = _.find(res, (entity) => entity.id === dto1.id)
    const r2 = _.find(res, (entity) => entity.id === dto2.id)
    const r3 = _.find(res, (entity) => entity.id === dto3.id)
    const r4 = _.find(res, (entity) => entity.id === dto4.id)

    expect(res.length).toEqual(4)
    expect(r1).toMatchObject(dto1)
    expect(r2).toMatchObject(dto2)
    expect(r3).toMatchObject(dto3)
    expect(r4).toMatchObject(dto4)
  })
})
