import { Test } from '@nestjs/testing'
import { UserService } from './user.service'
import { UserDto } from '@solomon/shared/util-klass'
import { dbService } from '@solomon/backend/service-db'

describe('UserService', () => {
  let userService: UserService

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [UserService],
    }).compile()

    userService = app.get<UserService>(UserService)
    await dbService.init()
  })

  beforeEach(async () => {
    await dbService.resetForTest()
  })

  afterAll(async () => {
    await dbService.close(true)
  })

  it('addPublicUser()', async () => {
    const user1 = new UserDto({
      email: 'foo1@b.ar',
    })
    const user2 = new UserDto({
      email: 'foo2@b.ar',
    })

    await userService.addPublicUser(user1)
    await userService.addPublicUser(user2)

    const res = await dbService.userRepository.findAll()

    expect(res[0]).toMatchObject(user1)
    expect(res[1]).toMatchObject(user2)
    expect(res[0].isAdmin).toEqual(false)
    expect(res[1].isAdmin).toEqual(false)
    expect(res[0].createDate.getTime()).toBeGreaterThanOrEqual(0)
    expect(res[1].createDate.getTime()).toBeGreaterThanOrEqual(0)
    expect(res[0].updateDate.getTime()).toBeGreaterThanOrEqual(0)
    expect(res[1].updateDate.getTime()).toBeGreaterThanOrEqual(0)
  })

  it('addAdminUser()', async () => {
    const user1 = new UserDto({
      email: 'foo1@b.ar',
    })
    const user2 = new UserDto({
      email: 'foo2@b.ar',
    })

    await userService.addAdminUser(user1)
    await userService.addAdminUser(user2)

    const res = await dbService.userRepository.findAll()

    expect(res[0]).toMatchObject(user1)
    expect(res[1]).toMatchObject(user2)
    expect(res[0].isAdmin).toEqual(true)
    expect(res[1].isAdmin).toEqual(true)
    expect(res[0].createDate.getTime()).toBeGreaterThanOrEqual(0)
    expect(res[1].createDate.getTime()).toBeGreaterThanOrEqual(0)
    expect(res[0].updateDate.getTime()).toBeGreaterThanOrEqual(0)
    expect(res[1].updateDate.getTime()).toBeGreaterThanOrEqual(0)
  })

  it('getUserById()', async () => {
    const user1 = new UserDto({
      email: 'foo1@b.ar',
    })
    const user2 = new UserDto({
      email: 'foo2@b.ar',
    })
    const user3 = new UserDto({
      email: 'foo2@b.ar',
    })
    const userEntity1 = dbService.userRepository.create(user1)
    const userEntity2 = dbService.userRepository.create(user2)
    const userEntity3 = dbService.userRepository.create(user3)

    userEntity2.isDeleted = true
    await dbService.userRepository.persistAndFlush([
      userEntity1,
      userEntity2,
      userEntity3,
    ])

    let res = await userService.getUserById(user1.id)

    expect(res.id).toEqual(user1.id)
    expect(res.email).toEqual(user1.email)
    expect(res['password']).not.toBeDefined()
    expect(res['isDeleted']).not.toBeDefined()
    expect(res['deleteDate']).not.toBeDefined()
  })

  it('updateUser()', async () => {
    const user1 = new UserDto({
      email: 'foo1@b.ar',
    })
    const user2 = new UserDto({
      email: 'foo2@b.ar',
    })
    const user3 = new UserDto({
      email: 'foo2@b.ar',
    })
    const userEntity1 = dbService.userRepository.create(user1)
    const userEntity2 = dbService.userRepository.create(user2)
    const userEntity3 = dbService.userRepository.create(user3)

    await dbService.userRepository.persistAndFlush([
      userEntity1,
      userEntity2,
      userEntity3,
    ])

    const beforeUpdateTime = Math.floor(Date.now() / 1000) * 1000
    user1.email = 'changed1@foo.bar'
    user2.email = 'changed2@foo.bar'
    await userService.updateUser(user1)
    await userService.updateUser(user2)

    const res = await dbService.userRepository.findAll()
    const r1 = res.find((r) => r.id === user1.id)
    const r2 = res.find((r) => r.id === user2.id)
    const r3 = res.find((r) => r.id === user3.id)

    expect(r1).toMatchObject(user1)
    expect(r2).toMatchObject(user2)
    expect(r3).toMatchObject(user3)
    expect(r1.updateDate.getTime()).toBeGreaterThanOrEqual(beforeUpdateTime)
    expect(r2.updateDate.getTime()).toBeGreaterThanOrEqual(beforeUpdateTime)
  })

  it('deleteUserById()', async () => {
    const user1 = new UserDto({
      email: 'foo1@b.ar',
    })
    const user2 = new UserDto({
      email: 'foo2@b.ar',
    })
    const user3 = new UserDto({
      email: 'foo2@b.ar',
    })
    const userEntity1 = dbService.userRepository.create(user1)
    const userEntity2 = dbService.userRepository.create(user2)
    const userEntity3 = dbService.userRepository.create(user3)

    await dbService.userRepository.persistAndFlush([
      userEntity1,
      userEntity2,
      userEntity3,
    ])

    const beforeDeleteTime = Math.floor(Date.now() / 1000) * 1000
    await userService.deleteUserById(user1.id)
    await userService.deleteUserById(user2.id)

    const res = await dbService.userRepository.findAll()
    const r1 = res.find((r) => r.id === user1.id)
    const r2 = res.find((r) => r.id === user2.id)
    const r3 = res.find((r) => r.id === user3.id)

    expect(r1.isDeleted).toEqual(true)
    expect(r2.isDeleted).toEqual(true)
    expect(r3.isDeleted).toEqual(false)
    expect(r1.deleteDate.getTime()).toBeGreaterThanOrEqual(beforeDeleteTime)
    expect(r2.deleteDate.getTime()).toBeGreaterThanOrEqual(beforeDeleteTime)
  })
})
