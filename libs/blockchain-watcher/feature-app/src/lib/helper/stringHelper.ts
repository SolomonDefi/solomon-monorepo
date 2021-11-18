import { sha256 } from 'js-sha256'

export class StringHelper {
  generateDisputeApiSignature(secretKey: string, value: string): string {
    return sha256.hmac(secretKey, value)
  }

  isEthAddress(str: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(str)
  }
}

export const stringHelper = new StringHelper()
