import { UserDto } from '@solomon/shared/util-klass'
import { dbService } from './dbService'
import { UserEntity } from '../entity/UserEntity'

export class UserDbService {
  async createPublicUsers(users: UserDto[]) {
    for (const user of users) {
      const entity = dbService.userRepository.create(user)
      const now = new Date()
      entity.isAdmin = false
      entity.createDate = now
      entity.updateDate = now
      dbService.userRepository.persist(entity)
    }

    await dbService.userRepository.flush()
  }

  async createAdminUser(users: UserDto[]) {
    for (const user of users) {
      const entity = dbService.userRepository.create(user)
      const now = new Date()
      entity.isAdmin = true
      entity.createDate = now
      entity.updateDate = now
      dbService.userRepository.persist(entity)
    }

    await dbService.userRepository.flush()
  }

  async getUserByIds(ids: string[]) {
    const entities = await dbService.userRepository.find({
      id: {
        $in: ids,
      },
      isDeleted: false,
    })

    return entities
  }

  async updateUsers(users: UserDto[]) {
    for (const user of users) {
      const entity = await dbService.userRepository.findOne({ id: user.id })
      entity.updateDate = new Date()
      dbService.userRepository.assign(entity, user)
    }

    await dbService.userRepository.flush()
  }

  async deleteUserByIds(ids: string[]) {
    const entities = await dbService.userRepository.find({
      id: {
        $in: ids,
      },
      isDeleted: false,
    })

    for (const entity of entities) {
      dbService.userRepository.assign(entity, {
        isDeleted: true,
        deleteDate: new Date(),
      })
    }

    await dbService.userRepository.flush()
  }

  async getUserByAccountPassword(email: string, password: string): Promise<UserEntity> {
    const entity = await dbService.userRepository.findOne({
      email: email,
      password: password,
      isDeleted: false,
    })

    return entity
  }
}

export const userDbService = new UserDbService()
