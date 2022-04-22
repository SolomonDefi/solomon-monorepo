import { sha256 } from 'js-sha256'
import { Base64 } from 'js-base64'

export class StringHelper {
  generateDisputeApiSignature(secretKey: string, value: string): string {
    let arr = sha256.hmac.digest(secretKey, value)
    return Base64.fromUint8Array(Uint8Array.from(arr))
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
