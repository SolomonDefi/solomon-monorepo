import { dbService } from './dbService'
import { UserDto } from '@solomon/shared/util-klass'
import { userDbService, UserDbService } from './userDbService'

describe('userDbService', () => {
  beforeAll(async () => {
    await dbService.init()
  })

  beforeEach(async () => {
    await dbService.resetForTest()
  })

  afterAll(async () => {
    await dbService.close(true)
  })

  it('constructor()', () => {
    expect(userDbService).toBeInstanceOf(UserDbService)
  })

  it('createPublicUsers()', async () => {
    const user1 = new UserDto({
      email: 'foo1@b.ar',
    })
    const user2 = new UserDto({
      email: 'foo2@b.ar',
    })

    await userDbService.createPublicUsers([user1, user2])

    const res = await dbService.userRepository.findAll()

    expect(res[0]).toMatchObject(user1)
    expect(res[1]).toMatchObject(user2)
    expect(res[0].isAdmin).toEqual(false)
    expect(res[1].isAdmin).toEqual(false)
    expect(res[0].createDate.getTime()).toBeGreaterThan(0)
    expect(res[1].createDate.getTime()).toBeGreaterThan(0)
    expect(res[0].updateDate.getTime()).toBeGreaterThan(0)
    expect(res[1].updateDate.getTime()).toBeGreaterThan(0)
    expect(res[0].createDate).toEqual(res[0].updateDate)
    expect(res[1].createDate).toEqual(res[1].updateDate)
  })

  it('createAdminUsers()', async () => {
    const user1 = new UserDto({
      email: 'foo1@b.ar',
    })
    const user2 = new UserDto({
      email: 'foo2@b.ar',
    })

    await userDbService.createAdminUser([user1, user2])

    const res = await dbService.userRepository.findAll()

    expect(res[0]).toMatchObject(user1)
    expect(res[1]).toMatchObject(user2)
    expect(res[0].isAdmin).toEqual(true)
    expect(res[1].isAdmin).toEqual(true)
    expect(res[0].createDate.getTime()).toBeGreaterThan(0)
    expect(res[1].createDate.getTime()).toBeGreaterThan(0)
    expect(res[0].updateDate.getTime()).toBeGreaterThan(0)
    expect(res[1].updateDate.getTime()).toBeGreaterThan(0)
    expect(res[0].createDate).toEqual(res[0].updateDate)
    expect(res[1].createDate).toEqual(res[1].updateDate)
  })

  it('getUserByIds()', async () => {
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

    const res = await userDbService.getUserByIds([user1.id])

    expect(res.length).toEqual(1)
    expect(res[0]).toMatchObject(user1)
  })

  it('updateUsers()', async () => {
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
    await userDbService.updateUsers([user1, user2])

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

  it('deleteUserByIds()', async () => {
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
    await userDbService.deleteUserByIds([user1.id, user2.id])

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

  it('getUserByAccountPassword()', async () => {
    const user1 = new UserDto({
      email: 'foo1@b.ar',
      password: 'hash1',
    })
    const user2 = new UserDto({
      email: 'foo2@b.ar',
      password: 'hash2',
    })
    const user3 = new UserDto({
      email: 'foo3@b.ar',
      password: 'hash3',
    })
    const userEntity1 = dbService.userRepository.create(user1)
    const userEntity2 = dbService.userRepository.create(user2)
    const userEntity3 = dbService.userRepository.create(user3)
    userEntity3.isDeleted = true

    await dbService.userRepository.persistAndFlush([
      userEntity1,
      userEntity2,
      userEntity3,
    ])

    const res1 = await userDbService.getUserByAccountPassword(user1.email, user1.password)
    const res2 = await userDbService.getUserByAccountPassword(user1.email, 'bad')
    const res3 = await userDbService.getUserByAccountPassword(user3.email, user3.password)

    expect(res1).toMatchObject(userEntity1)
    expect(res2).toEqual(null)
    expect(res3).toEqual(null)
  })
})
