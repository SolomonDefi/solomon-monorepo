import { dbService } from '@solomon/backend/service-db'

const run = async () => {
  await dbService.init()
  const exist = await dbService.userRepository.findOne({ id: 'root' })

  if (exist) {
    console.log('root admin is already exist')
    await dbService.close(true)
    return
  }

  const now = new Date()
  const adminUser = dbService.userRepository.create({
    id: 'root',
    email: 'foo@ba.r',
    password: 'just for test',
    isAdmin: true,
    createDate: now,
    updateDate: now,
  })

  await dbService.userRepository.persistAndFlush(adminUser)
  console.log('root admin generated')
  await dbService.close(true)
}

run()
