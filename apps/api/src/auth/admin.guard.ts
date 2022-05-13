import { CanActivate, ExecutionContext } from '@nestjs/common'
import jwt from 'jsonwebtoken'
import { envStore } from '@solomon/shared/store-env'
import { UserResult } from '@solomon/shared/util-klass'
import { userDbService } from '@solomon/backend/service-db'

export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req: Request = context.switchToHttp().getRequest()
      const authHeader = req.headers['authentication']
      const jwtToken = authHeader.replace('Bearer ', '')

      const payload = jwt.verify(jwtToken, envStore.jwtSecret)
      const userResult = new UserResult(payload as any)
      const userEntity = (await userDbService.getUserByIds([userResult.id]))[0]

      return userEntity.isAdmin
    } catch (err) {
      return false
    }
  }
}
