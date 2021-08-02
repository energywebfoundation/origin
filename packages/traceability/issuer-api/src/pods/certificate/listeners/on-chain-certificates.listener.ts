import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { constants, providers } from 'ethers';
import { CertificateUtils, IBlockchainProperties } from '@energyweb/issuer';
import { EventBus } from '@nestjs/cqrs';
import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';
import { CertificateCreatedEvent } from '../events/certificate-created-event';
import { SyncCertificateEvent } from '../events/sync-certificate-event';

enum EventType {
    IssuanceSingle = 'IssuanceSingle',
    IssuanceBatch = 'IssuanceBatch',
    TransferSingle = 'TransferSingle',
    TransferBatch = 'TransferBatch',
    ClaimSingle = 'ClaimSingle',
    ClaimBatch = 'ClaimBatch'
}

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
            (event: providers.Log) => this.processEvent(EventType.IssuanceSingle, event)
        );

        this.provider.on(
            this.registry.filters.IssuanceBatch(null, null, null),
            (event: providers.Log) => this.processEvent(EventType.IssuanceBatch, event)
        );

        this.provider.on(
            this.registry.filters.TransferSingle(null, null, null, null, null),
            (event: providers.Log) => this.processEvent(EventType.TransferSingle, event)
        );

        this.provider.on(
            this.registry.filters.TransferBatch(null, null, null, null, null),
            (event: providers.Log) => this.processEvent(EventType.TransferBatch, event)
        );

        this.provider.on(
            this.registry.filters.ClaimSingle(null, null, null, null, null, null),
            (event: providers.Log) => this.processEvent(EventType.ClaimSingle, event)
        );

        this.provider.on(
            this.registry.filters.ClaimBatch(null, null, null, null, null, null),
            (event: providers.Log) => this.processEvent(EventType.ClaimBatch, event)
        );
    }

    async processEvent(eventType: EventType, rawEvent: providers.Log): Promise<void> {
        if (!this.provider) {
            this.logger.debug(`Provider unavailable: ${JSON.stringify(this.provider)}`);
            return;
        }

        this.logger.debug(`Processing event ${eventType}: ${JSON.stringify(rawEvent)}`);

        const event = await CertificateUtils.decodeEvent(eventType, rawEvent, this.registry);

        // Allow some time for the backend controllers to finish processing
        // before processing blockchain events
        await sleep(2000);

        const logEvent = (type: EventType, ids: number[]) =>
            this.logger.log(`Detected a new event: ${type} on Certificate ${JSON.stringify(ids)}`);

        switch (eventType) {
            case EventType.IssuanceSingle:
                logEvent(EventType.IssuanceSingle, [event._id.toNumber()]);
                this.eventBus.publish(new CertificateCreatedEvent(event._id.toNumber()));
                break;

            case EventType.IssuanceBatch:
                event._ids.forEach((id: any) => {
                    logEvent(EventType.IssuanceBatch, [id.toNumber()]);
                    this.eventBus.publish(new CertificateCreatedEvent(id.toNumber()));
                });
                break;

            case EventType.TransferSingle:
                logEvent(EventType.TransferSingle, [event.id.toNumber()]);

                if (event.from === constants.AddressZero) {
                    this.logger.debug(
                        `Skipping TransferSingle handler for certificate ${event.id.toNumber()} because it's an issuance.`
                    );
                    break;
                }

                this.eventBus.publish(new SyncCertificateEvent(event.id.toNumber()));
                break;

            case EventType.TransferBatch:
                if (event.from === constants.AddressZero) {
                    this.logger.debug(
                        `Skipping TransferBatch handler for certificates ${event.ids
                            .map((id: any) => id.toNumber())
                            .join(', ')} because it's an issuance.`
                    );
                    break;
                }

                event.ids.forEach((id: any) => {
                    logEvent(EventType.TransferBatch, [id.toNumber()]);
                    this.eventBus.publish(new SyncCertificateEvent(id.toNumber()));
                });
                break;

            case EventType.ClaimSingle:
                logEvent(EventType.ClaimSingle, [event._id.toNumber()]);
                this.eventBus.publish(new SyncCertificateEvent(event._id.toNumber()));
                break;

            case EventType.ClaimBatch:
                event._ids.forEach((id: any) => {
                    logEvent(EventType.ClaimBatch, [id.toNumber()]);
                    this.eventBus.publish(new SyncCertificateEvent(id.toNumber()));
                });
                break;

            default:
                this.logger.log(
                    `No handlers found for event: ${eventType} on Certificate ${event._id.toNumber()}`
                );
        }
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
