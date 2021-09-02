import MailgunTransport from '../util/MailgunTransport';
import nodemailer, { Transporter } from 'nodemailer';

class MailService {

    mailer: Transporter = null;

    constructor() {

    }

    send = async (to: string | string[], subject: string, html: string, text: string) => {
        this.mailer.sendMail({
            from: 'solomondefi@gmail.com',
            to,
            subject,
            html,
            text
        }, (err, info) => {
            if (err) {
                console.log(`Error: ${err}`);
            } else {
                console.log(`Response: ${info}`);
            }
        });
    };

    // Notify both parties to an escrow contract that the contract has been deployed
    sendContractEmail = async (party1: string, party2: string) => {
        // TODO
        await this.send([party1, party2], 'Escrow contract created', '', '');
    };

    init = async () => {
        const auth = {
            auth: {
                api_key: 'key-1234123412341234',
                domain: 'one of your domain names listed at your https://app.mailgun.com/app/sending/domains'
            }
        };
        const transport = new MailgunTransport(auth);

        this.mailer = nodemailer.createTransport(transport.getPlugin());
    };
}

export default new MailService();
