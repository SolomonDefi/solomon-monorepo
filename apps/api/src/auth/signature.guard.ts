import { CanActivate, ExecutionContext } from '@nestjs/common'
import { stringHelper } from '@solomon/shared/util-helper'
import { envStore } from '@solomon/shared/store-env'

export class SignatureGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req: Request = context.switchToHttp().getRequest()
      const body = JSON.stringify(req.body)
      const signatureHeader = req.headers['x-signature']
      const expectSignature = stringHelper.generateApiSignature(envStore.apiSecret, body)

      return signatureHeader === expectSignature
    } catch (err) {
      return false
    }
  }
}
