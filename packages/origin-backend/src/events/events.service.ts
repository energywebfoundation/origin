import { Logger } from '@nestjs/common';
import WebSocket from 'ws';
import { getPort } from '../port';
import { IEvent } from './events.gateway';

type NewEvent = Omit<IEvent, 'timestamp'>;

enum MessageType {
    ALL_EVENTS,
    NEW_EVENT,
    INFO_MSG
}

const SEND_DELAY = 500;

export class EventService {
    public client: WebSocket;
    public allEvents: IEvent[] = [];

    private logger: Logger = new Logger('EventService');
    private started: boolean = false;
    private url: string;

    constructor(url: string = `http://localhost:${getPort() + 1}`) {
        this.url = url;
    }

    start() {
        this.client = new WebSocket(this.url);
        this.started = true;

        this.client.on('message', (msg: any) => {
            const msgType = this.getMessageType(msg);

            switch (msgType) {
                case MessageType.INFO_MSG:
                    this.logger.log(msg);
                    break;

                case MessageType.NEW_EVENT:
                    this.logger.log('New incoming event.');
                    this.allEvents.push(JSON.parse(msg));
                    break;

                case MessageType.ALL_EVENTS:
                    this.logger.log('Fetched all events.');
                    this.allEvents = JSON.parse(msg);
                    break;
            }
        });

        // Send it with a delay to avoid connection not open yet
        setTimeout(() => {
            this.logger.log('Fetching all events...');
            this.client.send(JSON.stringify({
                event: 'getAllEvents'
            }));
        }, SEND_DELAY)
    }

    stop() {
        this.started = false;
    }

    emit(event: NewEvent): void {
        if (!this.started) {
            this.start();
        }

        // Send it with a delay to avoid connection not open yet
        setTimeout(() => {
            this.logger.log(`Emitting a new ${event.name} event...`);

            this.client.send(JSON.stringify({
                event: 'events',
                data: event,
            }));

            this.logger.log('Emitted.');
        }, SEND_DELAY)
    }

    private getMessageType(msg: string): MessageType {
        let parsedMessage: any;

        try {
            parsedMessage = JSON.parse(msg);
        } catch (e) {
            this.logger.log('Unable to parse message, this is a string message.');
            return MessageType.INFO_MSG;
        }

        if (typeof parsedMessage === 'string') {
            return MessageType.INFO_MSG;
        }

        if (Array.isArray(parsedMessage)) {
            return MessageType.ALL_EVENTS;
        }

        if ('name' in parsedMessage && 'data' in parsedMessage && 'timestamp' in parsedMessage) {
            return MessageType.NEW_EVENT;
        }

        throw new Error('Unable to determine the type of the message.');
    }
}