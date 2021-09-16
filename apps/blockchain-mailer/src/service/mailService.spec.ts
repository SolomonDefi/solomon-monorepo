import mailService from './mailService'
import { exec } from 'child_process'
import { promisify } from 'util'
import { JSDOM } from 'jsdom'

describe('mailService', () => {
  jest.setTimeout(60 * 1000)

  test('constructor()', async () => {
    expect(mailService).toBeDefined()
  })

  test('send()', async () => {})

  test('getTemplateHtml()', async () => {
    await promisify(exec)('pnpx mailer:generate-template')

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
