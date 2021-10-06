import {
  I18nObject,
  SimpleI18n,
  getString,
  getArray,
  getRecord,
} from '@solomon/shared/util-i18n'

// Provide fallback English plugin text, if none is provided
const fallback: I18nObject = {
  title: 'Solomon Payments',
  secure: 'Protected by Solomon',
  solomon: 'SOLOMON',
  chargebacks: {
    label: 'DIRECT CHARGE',
    select: 'Select your cryptocurrency below:',
    select_label: 'Select Crypto',
    schedule: 'Schedule',
    protection: 'Charge Protection',
    price: 'Price',
    usd_price: 'USD Price',
    currency: {
      SLM: 'Solomon (SLM)',
      ETH: 'Ethereum (ETH)',
    },
  },
  preorder: {
    label: 'PREORDER',
    select: 'Prepay for a future delivery:',
  },
  escrow: {
    label: 'ESCROW',
    enter: 'Place funds into escrow',
  },
  continue: 'CONTINUE SHOPPING',
  confirm: 'CONFIRM',
}

export const i18n = new SimpleI18n(fallback)
export const ts = getString(i18n)
export const ta = getArray(i18n)
export const tr = getRecord(i18n)
