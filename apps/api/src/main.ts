import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { dbService } from '@solomon/backend/service-db'
import { loggerService } from '@solomon/shared/service-logger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const globalPrefix = 'api'
  const port = process.env.PORT || 3333

  await dbService.init()

  app.setGlobalPrefix(globalPrefix)
  await app.listen(port)

  loggerService.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  )
}

bootstrap()
