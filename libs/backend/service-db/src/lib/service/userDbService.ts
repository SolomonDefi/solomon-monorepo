import { UserDto } from '@solomon/shared/util-klass'
import { dbService } from './dbService'

export class UserDbService {
  async createPublicUsers(users: UserDto[]) {
    for (const user of users) {
      const entity = dbService.userRepository.create(user)
      entity.isAdmin = false
      entity.createDate = new Date()
      entity.updateDate = new Date()
      dbService.userRepository.persist(entity)
    }

    await dbService.userRepository.flush()
  }

  async createAdminUser(users: UserDto[]) {
    for (const user of users) {
      const entity = dbService.userRepository.create(user)
      entity.isAdmin = true
      entity.createDate = new Date()
      entity.updateDate = new Date()
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
}

export const userDbService = new UserDbService()
