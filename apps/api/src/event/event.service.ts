import { Injectable } from '@nestjs/common'
import { TEventDto } from '@solomon/shared/util-klass'
import { eventDbService } from '@solomon/backend/service-db'

@Injectable()
export class EventService {
  async saveEvent(eventDto: TEventDto) {
    await eventDbService.saveEvent([eventDto])
  }
}
