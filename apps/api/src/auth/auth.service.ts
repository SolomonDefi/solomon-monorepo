import { Injectable } from '@nestjs/common'
import { userDbService, UserEntity } from '@solomon/backend/service-db'
import { UserResult } from '@solomon/shared/util-klass'
import jwt from 'jsonwebtoken'
import { envStore } from '@solomon/shared/store-env'

@Injectable()
export class AuthService {
  async getJWT(email: string, password: string): Promise<string> {
    const entity = await userDbService.getUserByAccountPassword(email, password)

    if (!entity) {
      return null
    }

    const user = JSON.parse(JSON.stringify(new UserResult(entity)))
    const token = jwt.sign(user, envStore.jwtSecret)

    return token
  }
}
