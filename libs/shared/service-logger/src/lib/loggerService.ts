import { LoggerServiceLevel } from './LoggerServiceLevel'
import { format } from 'date-fns'

export class LoggerService {
  private _buffer: string[] = []
  private _weight: number = 0
  protected _threshold: number = 1000

  /**
   * Test only getter.
   */
  get buffer(): string[] {
    return this._buffer
  }

  /**
   * Test only getter.
   */
  get weight(): number {
    return this._weight
  }

  /**
   * Test only getter.
   */
  get threshold(): number {
    return this._threshold
  }

  error(...data: unknown[]) {
    console.error(...data)
    this.addToBuffer(LoggerServiceLevel.error, data)
  }

  warn(...data: unknown[]) {
    console.warn(...data)
    this.addToBuffer(LoggerServiceLevel.warn, data)
  }

  info(...data: unknown[]) {
    console.info(...data)
    this.addToBuffer(LoggerServiceLevel.info, data)
  }

  log(...data: unknown[]) {
    console.log(...data)
    this.addToBuffer(LoggerServiceLevel.verbose, data)
  }

  debug(...data: unknown[]) {
    console.debug(...data)
    this.addToBuffer(LoggerServiceLevel.debug, data)
  }

  async addToBuffer(level: LoggerServiceLevel, ...data: unknown[]) {
    const str: string = JSON.stringify(data)
    const time: string = format(new Date(), 'yyyy-MM-dd HH:mm:ss:SSS')
    const log: string = `[${time}][${level}] ${str}`

    this._buffer.push(log)

    switch (level) {
      case LoggerServiceLevel.error:
        this._weight += this._threshold
        break
      case LoggerServiceLevel.warn:
        this._weight += 100
        break
      case LoggerServiceLevel.info:
        this._weight += 10
        break
      case LoggerServiceLevel.verbose:
        this._weight += 1
        break
      case LoggerServiceLevel.debug:
        this._weight += 0
        break
    }

    if (this._weight >= this._threshold) {
      await this.flush()
    }
  }

  async saveToCloud(logs: string[]) {}

  clear() {
    this._buffer = []
    this._weight = 0
  }

  async flush() {
    await this.saveToCloud(this._buffer)
    this.clear()
  }
}

export const loggerService = new LoggerService()
