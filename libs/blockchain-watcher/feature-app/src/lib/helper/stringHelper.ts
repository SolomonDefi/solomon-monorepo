import { sha256 } from 'js-sha256'

export class StringHelper {
  generateDisputeApiSignature(secretKey: string, value: string): string {
    return sha256.hmac(secretKey, value)
  }

  generateRandomEthAddr(): string {
    const chs = '0123456789abcdefABCDEF'
    let res = '0x'

    for (let i = 1; i <= 40; i++) {
      const ri = Math.floor(Math.random() * 22)
      res += chs[ri]
    }

    return res
  }

  isEthAddress(str: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(str)
  }
}

export const stringHelper = new StringHelper()
