import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { connect, Connection, Channel } from 'amqplib/callback_api';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MessageService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(MessageService.name);

    private connection: Connection;

    private channel: Channel;

    private exchange: string;

    private queueConnectionString: string;

    private useMQ: boolean;

    constructor(private readonly configService: ConfigService) {
        this.queueConnectionString = this.configService.get<string>('QUEUE_CONNECTION_STRING');
        this.exchange = this.configService.get<string>('QUEUE_NAME');
        this.useMQ =
            this.configService.get<string>('USE_MESSAGE_QUEUE', 'false').toLowerCase() === 'true';
    }

    public onModuleInit() {
        this.logger.log('onModuleInit');

        if (!this.useMQ) {
            return;
        }

        this.logger.log('Initializing MessageService');
        connect(this.queueConnectionString, (conErr, con: Connection) => {
            if (conErr) {
                this.logger.error(conErr);
                throw conErr;
            }
            this.connection = con;
            this.logger.log('Connected to messaging queue');

            this.logger.log('Creating channel');
            this.connection.createChannel((chanErr, channel: Channel) => {
                if (chanErr) {
                    this.logger.error(chanErr);
                    throw chanErr;
                }
                this.channel = channel;
                this.logger.log('Channel created');

                this.channel.assertExchange(this.exchange, 'topic', {
                    durable: false
                });
            });
        });
    }

    public onModuleDestroy() {
        if (this.connection) {
            this.connection.close();
        }
    }

    public publish(message: string, topic: string) {
        if (!this.useMQ) {
            return;
        }

        this.logger.log('Publish item to external by messaging queue');
        this.logger.debug(message);
        if (this.channel) {
            this.channel.publish(this.exchange, topic, Buffer.from(message));
        } else {
            this.logger.warn('Messaging queue has not been initialized');
        }
    }
}