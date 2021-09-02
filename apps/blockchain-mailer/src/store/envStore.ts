class EnvStore {

    get isDev() {
        return process.env.NODE_ENV === 'development';
    }

    get isTest() {
        return process.env.NODE_ENV === 'test';
    }

    get ethereumNodeUrl() {
        return process.env.ETHEREUM_NODE_URL;
    }

    get factoryAddress() {
        return process.env.FACTORY_ADDRESS;
    }

    get mailgunApiKey() {
        return this.isDev
            ? 'key-1234123412341234'
            : ''
    }

    // one of your domain names listed at your https://app.mailgun.com/app/sending/domains
    get mailgunDomain() {
        return ''
    }
}

export default new EnvStore();
