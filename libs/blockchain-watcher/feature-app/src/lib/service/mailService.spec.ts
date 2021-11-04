import { mailService } from './mailService'
import { JSDOM } from 'jsdom'
import { generateMjmlTemplate } from '../util/generateMjmlTemplate'

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
    const templateHtml = await mailService.getTemplateHtml('_test.html')
    const finalHtml = templateHtml({
      foo: 'foo',
      bar: 'bar',
    })

    const dom = new JSDOM(finalHtml)
    const r1 = dom.window.document.querySelector('#foo')?.textContent
    const r2 = dom.window.document.querySelector('img')?.getAttribute('src')

    expect(r1).toEqual('foo')
    expect(r2).toEqual('bar')
  })

  test('sendChargebackCreatedEmail()', async () => {
    const realSend = mailService.send
    mailService.send = jest.fn()

    await mailService.sendChargebackCreatedEmail('foo' as any)

    expect(mailService.send.call.length).toEqual(1)

    mailService.send = realSend
  })

  test('sendPreorderCreatedEmail()', async () => {
    const realSend = mailService.send
    mailService.send = jest.fn()

    await mailService.sendPreorderCreatedEmail('foo' as any)

    expect(mailService.send.call.length).toEqual(1)

    mailService.send = realSend
  })

  test('sendEscrowCreatedEmail()', async () => {
    const realSend = mailService.send
    mailService.send = jest.fn()

    await mailService.sendEscrowCreatedEmail('foo' as any)

    expect(mailService.send.call.length).toEqual(1)

    mailService.send = realSend
  })
})
