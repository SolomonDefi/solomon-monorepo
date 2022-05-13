import { dbService } from '@solomon/backend/service-db'
import { Client } from 'pg'

const run = async () => {
  const dbName = 'solomon_db'

  console.log('Init db connection')
  const pg = new Client({
    user: 'postgres',
    password: 'postgres',
  })
  await pg.connect()
  const queryResult = await pg.query(`
    SELECT 1 FROM pg_database WHERE datname='${dbName}'
  `)

  if (queryResult.rowCount > 0) {
    console.log(`${dbName} already exist`)
  } else {
    console.log(`Creating ${dbName}`)
    await pg.query(`
      CREATE DATABASE ${dbName}
    `)
    console.log(`${dbName} created`)
  }

  await pg.end()
  await dbService.init()
  console.log('Reset DB schema')
  await dbService.reset()
  console.log('Reset DB schema done')
  await dbService.close(true)
  console.log('DB connection closed')
}

run()
