import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    MessageBody
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { getPort } from '../port'

import moment from 'moment';
import { SupportedEvents, SupportedEventType } from './events';

export interface IEvent {
    name: string;
    data: any;
    timestamp: number;
}

const PORT = getPort() + 1;

@WebSocketGateway(PORT, { transports: ['websocket'] })
export class EventsWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {

    private logger: Logger = new Logger('EventsWebSocketGateway');
    private allEvents: IEvent[] = [];

    wsClients: any[] = [];

    afterInit() {
        this.logger.log(`Initialized the WebSockets server on port: ${PORT}.`);
    }

    handleConnection(client: any) {
        this.wsClients.push(client);;

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
        this.logger.log(`Broadcasting a new "${event.name}" event.`);

        const content = JSON.stringify(event);

        for (let client of this.wsClients) {
            client.send(content);
        }
    }

    @SubscribeMessage('getAllEvents')
    getAllEvents(client: any) {
        this.logger.log('Client requested getting all events.');

        client.send(JSON.stringify(this.allEvents));
    }

    @SubscribeMessage('events')
    handleEvent(@MessageBody() payload: any) {
        this.logger.log(`Incoming message: ${JSON.stringify(payload)}`);

        const { name, data } = payload;

        if (!name || !data) {
            return 'Incorrect event structure';
        }

        const supportedEvents = Object.values(SupportedEvents);

        if (!supportedEvents.includes(name)) {
            return `Unsupported event name. Please use one of the following: ${supportedEvents.join(', ')}`;
        }

        const event = {
            name,
            data: data as SupportedEventType,
            timestamp: moment().unix()
        };

        this.allEvents.push(event);

        this.broadcastEvent(event);

        return `Saved ${name} event.`;
    }
}