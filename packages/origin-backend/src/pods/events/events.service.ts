import { Injectable, Inject } from '@nestjs/common';
import { NewEvent } from '@energyweb/origin-backend-core';
import { NotificationService } from '../notification';
import { EventsWebSocketGateway } from './events.gateway';

@Injectable()
export class EventsService {
    constructor(
        @Inject(EventsWebSocketGateway) private readonly eventGateway: EventsWebSocketGateway,
        private readonly notificationService: NotificationService
    ) {}

    public handleEvent(event: NewEvent) {
        this.eventGateway.handleEvent(event);
        this.notificationService.handleEvent(event);
    }
}
