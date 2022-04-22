import { QueryOrderNumeric } from '@mikro-orm/core'
import { dbService } from './dbService'

export class ScanLogDbService {
  async setLastScanned(blockHash: string) {
    let newLog = dbService.scanLogRepository.create({
      blockHash: blockHash,
      lastScanned: Date.now(),
    })

    await dbService.scanLogRepository.persistAndFlush(newLog)
  }

  async getLastScanned() {
    let lastLog = await dbService.scanLogRepository.find(
      {},
      {
        orderBy: {
          lastScanned: QueryOrderNumeric.DESC,
        },
        limit: 1,
      },
    )

    return lastLog[0]
  }
}

export const scanLogDbService = new ScanLogDbService()
