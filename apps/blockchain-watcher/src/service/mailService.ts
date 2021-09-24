import nodemailer, { Transporter } from 'nodemailer'
import MailgunTransport from '../util/MailgunTransport'
import envStore from '../store/envStore'
import { readFile } from 'fs-extra'
import path from 'path'
import Handlebars from 'handlebars'
import pathStore from '@solomon/shared/util-path-store'

class MailService {
  mailer: Transporter = null as any

  async send(to: string | string[], subject: string, html: string, text: string) {
    let info = await this.mailer.sendMail({
      from: 'solomondefi@gmail.com',
      to: to,
      subject: subject,
      html: html,
      text: text,
    })

    return info
  }

  async getTemplateHtml(htmlName: string): Promise<HandlebarsTemplateDelegate> {
    let htmlPath = path.resolve(pathStore.mailer, 'src', 'template', htmlName)
    let rawHtml = await readFile(htmlPath, 'utf-8')
    let templateHtml = Handlebars.compile(rawHtml)

    return templateHtml
  }

  async sendChargebackCreatedEmail(to: string) {
    let subject = 'Chargeback created'
    let templateHtml = await this.getTemplateHtml('chargebackCreated.html')
    let finalHtml = templateHtml({
      // TODO
    })
    let text = ''

    await this.send(to, subject, finalHtml, text)
  }

  async sendPreorderCreatedEmail(to: string) {
    let subject = 'Preorder created'
    let templateHtml = await this.getTemplateHtml('preorderCreated.html')
    let finalHtml = templateHtml({
      // TODO
    })
    let text = ''

    await this.send(to, subject, finalHtml, text)
  }

  async sendEscrowCreatedEmail(to: string) {
    let subject = 'Escrow created'
    let templateHtml = await this.getTemplateHtml('escrowCreated.html')
    let finalHtml = templateHtml({
      // TODO
    })
    let text = ''

    await this.send(to, subject, finalHtml, text)
  }

  async init() {
    const transport = new MailgunTransport({
      auth: {
        api_key: envStore.mailgunApiKey,
        domain: envStore.mailgunDomain,
      },
    })

    this.mailer = nodemailer.createTransport(transport.getPlugin())
  }

  constructor() {}
}

export default new MailService()
