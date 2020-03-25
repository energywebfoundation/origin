import { Module } from '@nestjs/common';
import { EventsWebSocketGateway } from './events.gateway';
import { NotificationModule } from '../notification';
import { EventsService } from './events.service';

@Module({
    imports: [NotificationModule],
    providers: [EventsWebSocketGateway, EventsService],
    exports: [EventsWebSocketGateway, EventsService]
})
export class EventsModule {}
