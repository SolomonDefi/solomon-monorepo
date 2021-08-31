import nodemailer from 'nodemailer';
import MailgunTransport from './util/MailgunTransport';

const auth = {
  auth: {
    api_key: 'key-1234123412341234',
    domain: 'one of your domain names listed at your https://app.mailgun.com/app/sending/domains'
  }
}

const transport = new MailgunTransport(auth);
const mailer = nodemailer.createTransport(transport.getPlugin());

// Notify both parties to an escrow contract that the contract has been deployed
export function sendContractEmail(party1: string, party2: string) {
  // TODO
  send([party1, party2], 'Escrow contract created', '', '');
}

export function send(to: string | string[], subject: string, html: string, text: string) {
  mailer.sendMail({
    from: 'solomondefi@gmail.com',
    to,
    subject,
    html,
    text,
    }, (err, info) => {
      if (err) {
        console.log(`Error: ${err}`);
      } else {
        console.log(`Response: ${info}`);
      }
  });
}
