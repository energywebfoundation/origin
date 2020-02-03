import WebSocket from 'ws';
import { IEvent, SupportedEvents } from '@energyweb/origin-backend-core';

export enum MessageType {
    ALL_EVENTS,
    NEW_EVENT,
    INFO_MSG
}

export interface ISubscription {
    event: SupportedEvents;
    callback: Function;
}

export interface IEventClient {
    start(): void;
    stop(): void;
    subscribe(event: SupportedEvents, callback: Function): void;
}

export class EventClient implements IEventClient {
    public client: WebSocket;
    public started: boolean = false;

    private allCallbacks: ISubscription[] = [];

    constructor(private url: string) {}

    start() {
        this.client = new WebSocket(this.url);
        this.started = true;

        this.client.on('message', (msg: any) => {
            console.log({msg})
            const msgType = this.getMessageType(msg);

            switch (msgType) {
                case MessageType.INFO_MSG:
                    console.log(msg);
                    break;

                case MessageType.NEW_EVENT:
                    console.log('New incoming event.');
                    const event: IEvent = JSON.parse(msg);
                    this.handleEvent(event);
                    break;
            }
        });
    }

    stop() {
        this.started = false;
    }

    subscribe(event: SupportedEvents, callback: Function) {
        this.allCallbacks.push({
            event,
            callback
        });
    }

    private handleEvent(event: IEvent) {
        const matchingCallbacks = this.allCallbacks.filter(cb => cb.event === event.type);
        matchingCallbacks.forEach(cb => cb.callback(event));
    }

    private getMessageType(msg: string): MessageType {
        let parsedMessage: IEvent;

        try {
            parsedMessage = JSON.parse(msg);
        } catch (e) {
            console.log('Unable to parse message, this is a string message.');
            return MessageType.INFO_MSG;
        }

        if (typeof parsedMessage === 'string') {
            return MessageType.INFO_MSG;
        }

        if (Array.isArray(parsedMessage)) {
            return MessageType.ALL_EVENTS;
        }

        if ('type' in parsedMessage && 'data' in parsedMessage && 'timestamp' in parsedMessage) {
            return MessageType.NEW_EVENT;
        }

        throw new Error('Unable to determine the type of the message.');
    }
}