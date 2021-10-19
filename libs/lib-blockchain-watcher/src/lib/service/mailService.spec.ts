import { mailService } from './mailService'
import { JSDOM } from 'jsdom'
import { generateMjmlTemplate } from '@solomon/lib-blockchain-watcher'

describe('mailService', () => {
  jest.setTimeout(60 * 1000)

  beforeAll(async () => {
    await generateMjmlTemplate()
  })

  test('constructor()', async () => {
    expect(mailService).toBeDefined()
  })

  test('init()', async () => {
    await expect(mailService.init()).resolves.not.toThrow()
  })

  test('send()', async () => {})

  test('getTemplateHtml()', async () => {
    let templateHtml = await mailService.getTemplateHtml('_test.html')
    let finalHtml = templateHtml({
      foo: 'foo',
      bar: 'bar',
    })

    let dom = new JSDOM(finalHtml)
    let r1 = dom.window.document.querySelector('#foo')?.textContent
    let r2 = dom.window.document.querySelector('img')?.getAttribute('src')

    expect(r1).toEqual('foo')
    expect(r2).toEqual('bar')
  })

  test('sendChargebackCreatedEmail()', async () => {
    let realSend = mailService.send
    mailService.send = jest.fn()

    await mailService.sendChargebackCreatedEmail('foo')

    expect(mailService.send.call.length).toEqual(1)

    mailService.send = realSend
  })

  test('sendPreorderCreatedEmail()', async () => {
    let realSend = mailService.send
    mailService.send = jest.fn()

    await mailService.sendPreorderCreatedEmail('foo')

    expect(mailService.send.call.length).toEqual(1)

    mailService.send = realSend
  })

  test('sendEscrowCreatedEmail()', async () => {
    let realSend = mailService.send
    mailService.send = jest.fn()

    await mailService.sendEscrowCreatedEmail('foo')

    expect(mailService.send.call.length).toEqual(1)

    mailService.send = realSend
  })
})
