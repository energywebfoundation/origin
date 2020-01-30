import { Module } from '@nestjs/common';
import { EventsWebSocketGateway } from './events.gateway';
import { EventService } from './events.service';

@Module({
    providers: [EventsWebSocketGateway, EventService],
    exports: [EventService]
})
export class EventsModule {}
