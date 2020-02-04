import { Module } from '@nestjs/common';
import { EventsWebSocketGateway } from './events.gateway';

@Module({
    providers: [EventsWebSocketGateway],
    exports: [EventsWebSocketGateway]
})
export class EventsModule {}
