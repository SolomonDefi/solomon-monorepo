import supertest from 'supertest'
import { envStore } from '@solomon/shared/store-env'
import { UserDto } from '@solomon/shared/util-klass'
import { stringHelper } from '@solomon/shared/util-helper'

describe('api /auth', () => {
  const api = supertest(`http://127.0.0.1:${envStore.apiPort}/api`)

  test('POST /login', async () => {
    const userDto = new UserDto({
      email: 'foo@b.ar',
      password: 'some_hash',
      ethAddress: stringHelper.generateRandomEthAddr(),
    })
    await api.post('/user').send(userDto).expect(201)

    const apiRes = await api
      .post('/auth/login')
      .send({
        email: userDto.email,
        password: userDto.password,
      })
      .expect(200)
    const token: string = apiRes.body['jwt']

    expect(typeof token).toEqual('string')
    expect(token.length).toBeGreaterThan(0)
  })

  test('POST /login Bad email', async () => {
    const userDto = new UserDto({
      email: 'foo@b.ar',
      password: 'some_hash',
      ethAddress: stringHelper.generateRandomEthAddr(),
    })
    await api.post('/user').send(userDto).expect(201)

    await api
      .post('/auth/login')
      .send({
        email: 'bad@foo.bar',
        password: userDto.password,
      })
      .expect(403)
  })

  test('POST /login Bad password', async () => {
    const userDto = new UserDto({
      email: 'foo@b.ar',
      password: 'some_hash',
      ethAddress: stringHelper.generateRandomEthAddr(),
    })
    await api.post('/user').send(userDto).expect(201)

    await api
      .post('/auth/login')
      .send({
        email: userDto.email,
        password: 'bad',
      })
      .expect(403)
  })
})
