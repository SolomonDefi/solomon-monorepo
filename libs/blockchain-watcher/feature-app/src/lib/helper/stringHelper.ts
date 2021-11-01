import { sha256 } from 'js-sha256'

export class StringHelper {
  generateDisputeApiSignature(secretKey: string, value: string): string {
    return sha256.hmac(secretKey, value)
  }

  generateRandomEthAddr(): string {
    let res = '0x'
    let chs = '0123456789abcdefABCDEF'

    for (let i = 1; i <= 40; i++) {
      let ri = Math.floor(Math.random() * 22)
      res += chs[ri]
    }

    return res
  }

  isEthAddress(str: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(str)
  }
}

export const stringHelper = new StringHelper()
