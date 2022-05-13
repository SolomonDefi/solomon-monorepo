import { Test } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { UserDto } from '@solomon/shared/util-klass'
import { dbService } from '@solomon/backend/service-db'

describe('AuthService', () => {
  let authService: AuthService

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [AuthService],
    }).compile()

    authService = app.get<AuthService>(AuthService)
    await dbService.init()
  })

  beforeEach(async () => {
    await dbService.resetForTest()
  })

  afterAll(async () => {
    await dbService.close(true)
  })

  it('getJWT()', async () => {
    const user1 = new UserDto({
      email: 'foo1@b.ar',
      password: 'hash1',
    })
    const user2 = new UserDto({
      email: 'foo2@b.ar',
      password: 'hash2',
    })
    const userEntity1 = dbService.userRepository.create(user1)
    const userEntity2 = dbService.userRepository.create(user2)

    await dbService.userRepository.persistAndFlush([userEntity1, userEntity2])

    const res1 = await authService.getJWT(user1.email, user1.password)
    const res2 = await authService.getJWT(user1.email, 'bad')
    const res3 = await authService.getJWT(null, user1.password)

    expect(typeof res1).toEqual('string')
    expect(res2).toEqual(null)
    expect(res3).toEqual(null)
  })
})
