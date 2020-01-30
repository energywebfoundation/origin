import { EventService } from './events.service';
import { SupportedEvents } from './events';

const eventService = new EventService('http://localhost:3031');

eventService.emit({
    name: SupportedEvents.CREATE_NEW_DEMAND,
    data: {
        demandId: 1
    }
})

setTimeout(() => {
    eventService.emit({
        name: SupportedEvents.CREATE_NEW_DEMAND,
        data: {
            demandId: 2
        }
    })
}, 10000)