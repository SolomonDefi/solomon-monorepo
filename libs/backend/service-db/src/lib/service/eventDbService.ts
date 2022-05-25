import { TEventDto } from '@solomon/shared/util-klass'
import { dbService } from './dbService'

export class EventDbService {
  async saveEvent(eventDtos: TEventDto[]) {
    for (const eventDto of eventDtos) {
      const eventEntity = dbService.eventRepository.create(eventDto)
      eventEntity.createDate = new Date()
      dbService.eventRepository.persist(eventEntity)
    }

    await dbService.eventRepository.flush()
  }
}

export const eventDbService = new EventDbService()
