import supertest from 'supertest'
import { envStore } from '@solomon/shared/store-env'
import { UserDto, UserResult } from '@solomon/shared/util-klass'
import { stringHelper } from '@solomon/shared/util-helper'
import { v4 } from 'uuid'
import jwt from 'jsonwebtoken'

describe('api /user', () => {
  const api = supertest(`http://127.0.0.1:${envStore.apiPort}/api`)
  const getAdminToken = async (): Promise<string> => {
    const rootAdmin = {
      email: 'foo@ba.r',
      password: 'just for test',
    }
    const apiRes = await api.post('/auth/login').send(rootAdmin)
    const jwt = apiRes.body['jwt']
    const token = 'Bearer ' + jwt

    return token
  }

  test('POST /user', async () => {
    const userDto = new UserDto({
      email: 'foo@b.ar',
      ethAddress: stringHelper.generateRandomEthAddr(),
    })

    await api.post('/user').send(userDto).expect(201)
  })

  test('POST /user Invalid input', async () => {
    const userDto = new UserDto({
      email: 'bad',
      ethAddress: stringHelper.generateRandomEthAddr(),
    })

    await api.post('/user').send(userDto).expect(400)
  })

  test('POST /admin', async () => {
    const userDto = new UserDto({
      email: 'foo@b.ar',
      ethAddress: stringHelper.generateRandomEthAddr(),
    })
    const token = await getAdminToken()

    await api.post('/user/admin').set('Authentication', token).send(userDto).expect(201)
  })

  test('POST /user/admin Without token', async () => {
    const userDto = new UserDto({
      email: 'foo@b.ar',
      ethAddress: stringHelper.generateRandomEthAddr(),
    })

    await api.post('/user/admin').send(userDto).expect(403)
  })

  test('GET /user/:id', async () => {
    const userDto = new UserDto({
      id: v4(),
      email: 'foo@b.ar',
      ethAddress: stringHelper.generateRandomEthAddr(),
    })
    await api.post('/user').send(userDto)

    const apiRes = await api.get(`/user/${userDto.id}`).expect(200)
    const res = new UserResult(apiRes.body)

    expect(res.id).toEqual(userDto.id)
    expect(res.email).toEqual(userDto.email)
    expect(res.ethAddress).toEqual(userDto.ethAddress)
    expect(res.createDate).toBeDefined()
    expect(res.updateDate).toBeDefined()
    expect(res.createDate).toEqual(res.updateDate)
  })

  test('PUT /user', async () => {
    const userDto = new UserDto({
      id: v4(),
      email: 'foo@b.ar',
      ethAddress: stringHelper.generateRandomEthAddr(),
    })
    await api.post('/user').send(userDto)

    // pgsql not save ms, so need a wait to make them different
    await new Promise((resolve, reject) => setTimeout(resolve, 1000))

    userDto.email = 'foo2@b.ar'
    await api.put('/user').send(userDto).expect(200)

    const apiRes = await api.get(`/user/${userDto.id}`)
    const res = new UserResult(apiRes.body)

    expect(res.id).toEqual(userDto.id)
    expect(res.email).toEqual(userDto.email)
    expect(res.ethAddress).toEqual(userDto.ethAddress)
    expect(res.createDate).toBeDefined()
    expect(res.updateDate).toBeDefined()
    expect(res.createDate.getTime()).toBeLessThan(res.updateDate.getTime())
  })

  test('DELETE /user/:id', async () => {
    const userDto = new UserDto({
      id: v4(),
      email: 'foo@b.ar',
      ethAddress: stringHelper.generateRandomEthAddr(),
    })
    const token = await getAdminToken()
    await api.post('/user').send(userDto)
    await api.get(`/user/${userDto.id}`).expect(200)

    await api.delete(`/user/${userDto.id}`).set('Authentication', token).expect(200)
  })

  test('DELETE /user/:id Without permission', async () => {
    const userDto = new UserDto({
      id: v4(),
      email: 'foo@b.ar',
      ethAddress: stringHelper.generateRandomEthAddr(),
    })
    await api.post('/user').send(userDto)
    await api.get(`/user/${userDto.id}`).expect(200)

    await api.delete(`/user/${userDto.id}`).expect(403)
  })
})
