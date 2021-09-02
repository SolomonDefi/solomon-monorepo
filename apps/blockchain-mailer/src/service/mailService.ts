import nodemailer, { Transporter } from 'nodemailer';
import MailgunTransport from '../util/MailgunTransport';
import envStore from '../store/envStore';

class MailService {

    mailer: Transporter = null as any

    send = async (to: string | string[], subject: string, html: string, text: string) => {
        let info = await this.mailer.sendMail({
            from: 'solomondefi@gmail.com',
            to: to,
            subject: subject,
            html: html,
            text: text,
        })

        return info
    }

    // Notify both parties to an escrow contract that the contract has been deployed
    sendContractEmail = async (party1: string, party2: string) => {
        // TODO
        await this.send([party1, party2], 'Escrow contract created', '', '')
    }

    init = async () => {
        const transport = new MailgunTransport({
            auth: {
                api_key: envStore.mailgunApiKey,
                domain: envStore.mailgunDomain,
            }
        })

        this.mailer = nodemailer.createTransport(transport.getPlugin())
    }

    constructor() {

    }
}

export default new MailService()
