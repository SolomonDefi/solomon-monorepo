import express, { Request, Response } from 'express'
import { Express } from 'express'
import * as http from 'http'
import { once } from 'events'
import { promisify } from 'util'

export class AppService {
  PORT = 3001
  app: Express | null = null
  server: http.Server | null = null

  async onHealthCheck(req: Request, res: Response) {
    res.status(204).send()
  }

  async start(): Promise<void> {
    this.server = this.app.listen(this.PORT)
    await once(this.server, 'listening')
    console.log(`Api service listen on :${this.PORT}`)
  }

  async stop(): Promise<void> {
    if (!this.server) {
      return
    }

    try {
      await promisify(this.server.close).call(this.server)()
      console.log(`Api service on :${this.PORT} closed`)
    } catch (err) {
      console.error(err)
      console.log(`Fail to close api service on :${this.PORT}`)
    }
  }

  async init() {
    this.app = express()
    this.app.get('/health-check', this.onHealthCheck)
  }

  async destroy() {
    if (this.server) {
      this.server.close()
      this.server = null
    }
    this.app = null
  }
}

export const appService = new AppService()
