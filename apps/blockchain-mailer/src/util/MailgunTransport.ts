import Mailgun from 'mailgun.js';
import formData from 'form-data';
import packageData from '../../../../package.json';

const whitelist = [
    ['replyTo', 'h:Reply-To'],
    ['messageId', 'h:Message-Id'],
    [/^h:/],
    [/^v:/],
    ['from'],
    ['to'],
    ['cc'],
    ['bcc'],
    ['subject'],
    ['text'],
    ['template'],
    ['html'],
    ['attachment'],
    ['inline'],
    ['recipient-variables'],
    ['o:tag'],
    ['o:campaign'],
    ['o:dkim'],
    ['o:deliverytime'],
    ['o:testmode'],
    ['o:tracking'],
    ['o:tracking-clicks'],
    ['o:tracking-opens'],
    ['o:require-tls'],
    ['o:skip-verification'],
    ['X-Mailgun-Variables']
];

export default class MailgunTransport {
    options: any;
    messages: any;
    domain: string;

    constructor(options: any = {}) {
        const mailgun = new Mailgun(formData as any);
        let url = options.url;
        if (!options.url && options.host) {
            const mailgunUrl = new URL(`https://${options.host || 'api.mailgun.net'}`);
            mailgunUrl.protocol = options.protocol || 'https:';
            mailgunUrl.port = options.port || 443;
            url = mailgunUrl.href;
        }
        this.domain = options.auth.domain || '';
        this.messages = mailgun.client({
            username: 'api',
            key: options.auth.api_key || options.auth.apiKey,
            url
        }).messages;
        this.options = options;

    }

    getPlugin() {
        const self = this;
        const mailgunSend = (mail: any) => self.messages.create(self.domain, mail);
        return {
            name: 'Mailgun',
            version: packageData.version,
            send: this.send(mailgunSend),
            messages: this.messages,
            options: this.options
        };
    }

    applyKeyWhitelist(mail: any) {
        return Object.keys(mail).reduce((acc, key) => {
            const targetKey = whitelist.reduce((result, prev: any) => {
                const { cond, target } = prev;
                if (result) {
                    return result;
                }
                if ((cond.exec && cond.exec(key)) || cond === key) {
                    return target || key;
                }
                return null;
            }, null);
            if (!targetKey || !mail[key]) {
                return acc;
            }
            return { ...acc, [targetKey]: mail[key] };
        }, {});
    }

    makeAllTextAddresses(mail: any) {
        const keys = ['from', 'to', 'cc', 'bcc', 'replyTo'];
        const makeTextAddresses = (addresses: any) => {
            const validAddresses = [].concat(addresses).filter(Boolean);
            const textAddresses = validAddresses.map((item: any) =>
                item.address
                    ? item.name
                        ? item.name + ' <' + item.address + '>'
                        : item.address
                    : typeof item === 'string'
                        ? item
                        : null
            );
            return textAddresses.filter(Boolean).join();
        };
        const result = keys.reduce((result, key) => {
            const textAddresses = makeTextAddresses(mail[key]);
            if (!textAddresses) {
                return result;
            }
            return { ...result, [key]: textAddresses };
        }, {});
        return result;
    };

    async send(mailgunSend: any) {
        const self = this;
        return async (sendData: any, callback: any) => {
            const { data } = sendData;
            try {
                const addresses = this.makeAllTextAddresses(data);
                const extendedMail = {
                    ...data,
                    ...addresses
                };
                const whitelistedMail = self.applyKeyWhitelist(extendedMail);
                const result = await mailgunSend(whitelistedMail);
                callback(null, { ...result, messageId: result.id });
            } catch (error) {
                callback(error);
            }
        };
    }
}
