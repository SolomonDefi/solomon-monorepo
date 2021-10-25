import express, { Request, Response } from 'express'
import { Express } from 'express'
import * as http from 'http'

export class AppService {
  PORT = 3001
  app: Express
  server: http.Server

  async onHealthCheck(req: Request, res: Response) {
    res.status(204).send()
  }

  async start(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.server = this.app.listen(this.PORT, resolve)
      console.log(`Api service listen on :${this.PORT}`)
    })
  }

  async stop(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          console.error(err)
          reject(err)
        } else {
          console.log(`Api service on :${this.PORT} closed`)
          resolve()
        }
      })
    })
  }

  async init() {
    this.app = express()
    this.app.all('/health-check', this.onHealthCheck)
  }

  async destroy() {
    if (this.server) {
      this.server.close()
      delete this.server
    }
    delete this.app
  }
}

export const appService = new AppService()
