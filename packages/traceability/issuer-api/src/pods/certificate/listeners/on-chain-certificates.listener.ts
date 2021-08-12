import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { constants, providers } from 'ethers';
import { CertificateUtils, IBlockchainProperties } from '@energyweb/issuer';
import { EventBus } from '@nestjs/cqrs';
import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';
import { CertificateCreatedEvent } from '../events/certificate-created-event';
import { SyncCertificateEvent } from '../events/sync-certificate-event';
import { BlockchainEventType } from '../types';
import { NewTransactionProcessedEvent } from '../events/new-transaction-processed.event';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class OnChainCertificateWatcher implements OnModuleInit {
    private readonly logger = new Logger(OnChainCertificateWatcher.name);

    public provider: providers.FallbackProvider | providers.JsonRpcProvider;

    public registry: IBlockchainProperties['registry'];

    constructor(
        private readonly blockchainPropertiesService: BlockchainPropertiesService,
        private readonly eventBus: EventBus
    ) {}

    public async onModuleInit(): Promise<void> {
        this.logger.debug('OnModuleInit');

        const blockchainProperties = await this.blockchainPropertiesService.get();
        const { web3, registry } = blockchainProperties.wrap();

        this.provider = web3;
        this.registry = registry;

        this.provider.on(
            this.registry.filters.IssuanceSingle(null, null, null),
            (event: providers.Log) => this.processEvent(BlockchainEventType.IssuanceSingle, event)
        );

        this.provider.on(
            this.registry.filters.IssuanceBatch(null, null, null),
            (event: providers.Log) => this.processEvent(BlockchainEventType.IssuanceBatch, event)
        );

        this.provider.on(
            this.registry.filters.TransferSingle(null, null, null, null, null),
            (event: providers.Log) => this.processEvent(BlockchainEventType.TransferSingle, event)
        );

        this.provider.on(
            this.registry.filters.TransferBatch(null, null, null, null, null),
            (event: providers.Log) => this.processEvent(BlockchainEventType.TransferBatch, event)
        );

        this.provider.on(
            this.registry.filters.ClaimSingle(null, null, null, null, null, null),
            (event: providers.Log) => this.processEvent(BlockchainEventType.ClaimSingle, event)
        );

        this.provider.on(
            this.registry.filters.ClaimBatch(null, null, null, null, null, null),
            (event: providers.Log) => this.processEvent(BlockchainEventType.ClaimBatch, event)
        );
    }

    async processEvent(eventType: BlockchainEventType, rawEvent: providers.Log): Promise<void> {
        if (!this.provider) {
            this.logger.debug(`Provider unavailable: ${JSON.stringify(this.provider)}`);
            return;
        }

        this.logger.debug(`Processing event ${eventType}: ${JSON.stringify(rawEvent)}`);

        const event = await CertificateUtils.decodeEvent(eventType, rawEvent, this.registry);

        // Allow some time for the backend controllers to finish processing
        // before processing blockchain events
        await sleep(2000);

        const logEvent = (type: BlockchainEventType, ids: number[]) =>
            this.logger.log(`Detected a new event: ${type} on Certificate ${JSON.stringify(ids)}`);

        switch (eventType) {
            case BlockchainEventType.IssuanceSingle:
                logEvent(BlockchainEventType.IssuanceSingle, [event._id.toNumber()]);
                this.eventBus.publish(new CertificateCreatedEvent(event._id.toNumber()));
                break;

            case BlockchainEventType.IssuanceBatch:
                event._ids.forEach((id: any) => {
                    logEvent(BlockchainEventType.IssuanceBatch, [id.toNumber()]);
                    this.eventBus.publish(new CertificateCreatedEvent(id.toNumber()));
                });
                break;

            case BlockchainEventType.TransferSingle:
                logEvent(BlockchainEventType.TransferSingle, [event.id.toNumber()]);

                if (event.from === constants.AddressZero) {
                    this.logger.debug(
                        `Skipping TransferSingle handler for certificate ${event.id.toNumber()} because it's an issuance.`
                    );
                    break;
                }

                this.eventBus.publish(new SyncCertificateEvent(event.id.toNumber()));
                break;

            case BlockchainEventType.TransferBatch:
                if (event.from === constants.AddressZero) {
                    this.logger.debug(
                        `Skipping TransferBatch handler for certificates ${event.ids
                            .map((id: any) => id.toNumber())
                            .join(', ')} because it's an issuance.`
                    );
                    break;
                }

                event.ids.forEach((id: any) => {
                    logEvent(BlockchainEventType.TransferBatch, [id.toNumber()]);
                    this.eventBus.publish(new SyncCertificateEvent(id.toNumber()));
                });
                break;

            case BlockchainEventType.ClaimSingle:
                logEvent(BlockchainEventType.ClaimSingle, [event._id.toNumber()]);
                this.eventBus.publish(new SyncCertificateEvent(event._id.toNumber()));
                break;

            case BlockchainEventType.ClaimBatch:
                event._ids.forEach((id: any) => {
                    logEvent(BlockchainEventType.ClaimBatch, [id.toNumber()]);
                    this.eventBus.publish(new SyncCertificateEvent(id.toNumber()));
                });
                break;

            default:
                this.logger.log(
                    `No handlers found for event: ${eventType} on Certificate ${event._id.toNumber()}`
                );
        }

        this.eventBus.publish(
            new NewTransactionProcessedEvent({
                event,
                transactionType: eventType
            })
        );
    }

    onApplicationShutdown(): void {
        this.logger.debug('onApplicationShutdown');

        this.provider.off(this.registry.filters.IssuanceSingle(null, null, null));
        this.provider.off(this.registry.filters.IssuanceBatch(null, null, null));
        this.provider.off(this.registry.filters.TransferSingle(null, null, null, null, null));
        this.provider.off(this.registry.filters.TransferBatch(null, null, null, null, null));
        this.provider.off(this.registry.filters.ClaimSingle(null, null, null, null, null, null));
        this.provider.off(this.registry.filters.ClaimBatch(null, null, null, null, null, null));

        this.provider = null;
    }
}
