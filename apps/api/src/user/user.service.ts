import { Injectable } from '@nestjs/common'
import { UserDto, UserResult } from '@solomon/shared/util-klass'
import { userDbService } from '@solomon/backend/service-db'

@Injectable()
export class UserService {
  async addPublicUser(user: UserDto) {
    await userDbService.createPublicUsers([user])
  }

  async addAdminUser(user: UserDto) {
    await userDbService.createAdminUser([user])
  }

  async getUserById(id: string): Promise<UserResult> {
    let res = await userDbService.getUserByIds([id])

    return new UserResult(res[0])
  }

  async updateUser(user: UserDto) {
    await userDbService.updateUsers([user])
  }

  async deleteUserById(id: string) {
    await userDbService.deleteUserByIds([id])
  }
}
