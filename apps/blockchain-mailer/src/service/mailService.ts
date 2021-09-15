import nodemailer, { Transporter } from "nodemailer";
import MailgunTransport from "../util/MailgunTransport";
import envStore from "../store/envStore";

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

  async sendChargebackCreatedEmail(to: string) {
    // TODO
    await this.send(to, 'ChargebackCreated', '', '')
  }

  async sendPreorderCreatedEmail(to: string) {
    // TODO
    await this.send(to, 'PreorderCreated', '', '')
  }

  async sendEscrowCreatedEmail(to: string) {
    // TODO
    await this.send(to, 'EscrowCreated', '', '')
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
