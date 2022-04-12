import { LoggerService, loggerService } from './loggerService'

describe('loggerService basic', () => {
  test('constructor()', async () => {
    expect(loggerService).toBeInstanceOf(LoggerService)
  })

  test('clear()', async () => {
    loggerService['_buffer'] = ['', '']
    loggerService['_weight'] = 50

    expect(loggerService.buffer).toEqual(['', ''])
    expect(loggerService.weight).toEqual(50)
    loggerService.clear()
    expect(loggerService.buffer).toEqual([])
    expect(loggerService.weight).toEqual(0)
  })

  test('flush()', async () => {
    const f1 = loggerService.saveToCloud
    loggerService.saveToCloud = jest.fn()
    loggerService['_buffer'] = ['', '']
    loggerService['_weight'] = 50

    expect(loggerService.buffer).toEqual(['', ''])
    expect(loggerService.weight).toEqual(50)
    await loggerService.flush()
    expect(loggerService.buffer).toEqual([])
    expect(loggerService.weight).toEqual(0)
    expect(loggerService.saveToCloud).toBeCalled()

    loggerService.saveToCloud = f1
  })
})

describe('loggerService loggers', () => {
  beforeEach(async () => {
    loggerService.clear()
  })

  test('error()', async () => {
    const f1 = console.error
    const f2 = loggerService.saveToCloud
    console.error = jest.fn()
    loggerService.saveToCloud = jest.fn()

    loggerService.error('')
    expect(console.error).toBeCalled()
    expect(loggerService.saveToCloud).toBeCalled()

    console.error = f1
    loggerService.saveToCloud = f2
  })

  test('warn()', async () => {
    const f1 = console.warn
    const f2 = loggerService.saveToCloud

    console.warn = jest.fn()
    loggerService.saveToCloud = jest.fn()

    loggerService.warn('')
    expect(console.warn).toBeCalled()
    expect(loggerService.saveToCloud).not.toBeCalled()

    for (let i = 0; i < 9; i++) {
      loggerService.warn('')
    }

    expect(loggerService.saveToCloud).toBeCalled()

    console.warn = f1
    loggerService.saveToCloud = f2
  })

  test('info()', async () => {
    const f1 = console.info
    const f2 = loggerService.saveToCloud

    console.info = jest.fn()
    loggerService.saveToCloud = jest.fn()

    loggerService.info('')
    expect(console.info).toBeCalled()
    expect(loggerService.saveToCloud).not.toBeCalled()

    for (let i = 0; i < 99; i++) {
      loggerService.info('')
    }

    expect(loggerService.saveToCloud).toBeCalled()

    console.info = f1
    loggerService.saveToCloud = f2
  })

  test('log()', async () => {
    const f1 = console.log
    const f2 = loggerService.saveToCloud

    console.log = jest.fn()
    loggerService.saveToCloud = jest.fn()

    loggerService.log('')
    expect(console.log).toBeCalled()
    expect(loggerService.saveToCloud).not.toBeCalled()

    for (let i = 0; i < 999; i++) {
      loggerService.log('')
    }

    expect(loggerService.saveToCloud).toBeCalled()

    console.log = f1
    loggerService.saveToCloud = f2
  })

  test('debug()', async () => {
    const f1 = console.debug
    const f2 = loggerService.saveToCloud

    console.debug = jest.fn()
    loggerService.saveToCloud = jest.fn()

    loggerService.debug('')
    expect(console.debug).toBeCalled()
    expect(loggerService.saveToCloud).not.toBeCalled()

    for (let i = 0; i < 9999; i++) {
      loggerService.debug('')
    }

    expect(loggerService.saveToCloud).not.toBeCalled()

    console.debug = f1
    loggerService.saveToCloud = f2
  })
})
