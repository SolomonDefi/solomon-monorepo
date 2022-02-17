import path from 'path'
import nodemailer, { Transporter } from 'nodemailer'
import { readFile } from 'fs-extra'
import Handlebars from 'handlebars'
import { pathStore } from '@solomon/shared/util-path-store'
import MailgunTransport from '../util/MailgunTransport'
import { envStore } from '../store/envStore'
import { SlmChargeback, SlmEscrow, SlmPreorder } from '@solomon/shared/util-contract'

export class MailService {
  mailer: Transporter = null as any

  async send(to: string | string[], subject: string, html: string, text: string) {
    const info = await this.mailer.sendMail({
      from: 'solomondefi@gmail.com',
      to: to,
      subject: subject,
      html: html,
      text: text,
    })

    return info
  }

  async getTemplateHtml(htmlName: string): Promise<HandlebarsTemplateDelegate> {
    const htmlPath = path.resolve(pathStore.mailTemplates, htmlName)
    const rawHtml = await readFile(htmlPath, 'utf-8')
    const templateHtml = Handlebars.compile(rawHtml)

    return templateHtml
  }

  async sendChargebackCreatedEmail(slmChargeback: SlmChargeback) {
    const subject = 'Chargeback created'
    const templateHtml = await this.getTemplateHtml('chargebackCreated.html')
    const finalHtml = templateHtml({
      // TODO
    })
    let text = ''

    await this.send('to', subject, finalHtml, text)
  }

  async sendPreorderCreatedEmail(slmPreorder: SlmPreorder) {
    const subject = 'Preorder created'
    const templateHtml = await this.getTemplateHtml('preorderCreated.html')
    const finalHtml = templateHtml({
      // TODO
    })
    const text = ''

    await this.send('to', subject, finalHtml, text)
  }

  async sendEscrowCreatedEmail(slmEscrow: SlmEscrow) {
    const subject = 'Escrow created'
    const templateHtml = await this.getTemplateHtml('escrowCreated.html')
    const finalHtml = templateHtml({
      // TODO
    })
    const text = ''

    await this.send('to', subject, finalHtml, text)
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

export const mailService = new MailService()
