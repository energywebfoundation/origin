/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    MessageBody
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';

import moment from 'moment';
import { SupportedEvents, IEvent, NewEvent } from '@energyweb/origin-backend-core';
import { getEventsServerPort } from '../../port';

const PORT = getEventsServerPort();

@WebSocketGateway(PORT, { transports: ['websocket'] })
export class EventsWebSocketGateway
    implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private logger: Logger = new Logger('EventsWebSocketGateway');

    private allEvents: IEvent[] = [];

    wsClients: any[] = [];

    afterInit() {
        this.logger.log(`Initialized the WebSockets server on port: ${PORT}.`);
    }

    handleConnection(client: any) {
        this.wsClients.push(client);

        this.logger.log(`Client connected. Total clients connected: ${this.wsClients.length}`);
    }

    handleDisconnect(client: any) {
        for (let i = 0; i < this.wsClients.length; i++) {
            if (this.wsClients[i] === client) {
                this.wsClients.splice(i, 1);
                this.logger.log(`Client disconnected`);
                break;
            }
        }
    }

    private broadcastEvent(event: IEvent) {
        this.logger.log(`Broadcasting a new "${event.type}" event.`);

        const content = JSON.stringify(event);

        for (const client of this.wsClients) {
            client.send(content);
        }
    }

    @SubscribeMessage('getAllEvents')
    getAllEvents(client: any) {
        this.logger.log('Client requested getting all events.');

        client.send(JSON.stringify(this.allEvents));
    }

    @SubscribeMessage('events')
    handleEvent(@MessageBody() incomingEvent: NewEvent) {
        this.logger.log(`Incoming event: ${JSON.stringify(incomingEvent)}`);

        const { type, data } = incomingEvent;

        if (!type || !data) {
            return 'Incorrect event structure';
        }

        const supportedEvents = Object.values(SupportedEvents);

        if (!supportedEvents.includes(type)) {
            return `Unsupported event name. Please use one of the following: ${supportedEvents.join(
                ', '
            )}`;
        }

        const event: IEvent = {
            ...incomingEvent,
            timestamp: moment().unix()
        };

        this.allEvents.push(event);

        this.broadcastEvent(event);

        return `Saved ${type} event.`;
    }
}
