import { sha256 } from 'js-sha256'

export class StringHelper {
  generateDisputeApiSignature(secretKey, value): string {
    return sha256.hmac(secretKey, value)
  }
}

export const stringHelper = new StringHelper()
