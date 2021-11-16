import { LoggerService, loggerService } from "./loggerService";

describe('loggerService', ()=> {
  test('constructor()', async ()=> {
    expect(loggerService).toBeInstanceOf(LoggerService)
  })
})
