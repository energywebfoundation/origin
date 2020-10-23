import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Contract, providers } from 'ethers';
import { CertificateUtils } from '@energyweb/issuer';
import { EventBus } from '@nestjs/cqrs';
import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';
import { CertificateCreatedEvent } from '../events/certificate-created-event';
import { SyncCertificateEvent } from '../events/sync-certificate-event';

enum EventType {
    IssuanceSingle = 'IssuanceSingle',
    TransferSingle = 'TransferSingle',
    ClaimSingle = 'ClaimSingle'
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class OnChainCertificateWatcher implements OnModuleInit {
    private readonly logger = new Logger(OnChainCertificateWatcher.name);

    public provider: providers.FallbackProvider | providers.JsonRpcProvider;

    public registry: Contract;

    constructor(
        private readonly blockchainPropertiesService: BlockchainPropertiesService,
        private readonly eventBus: EventBus
    ) {}

    public async onModuleInit(): Promise<void> {
        const blockchainProperties = await this.blockchainPropertiesService.get();
        const { web3, registry } = blockchainProperties.wrap();

        this.provider = web3;
        this.registry = registry;

        this.provider.on(
            registry.filters.IssuanceSingle(null, null, null),
            (event: providers.Log) => this.processEvent(EventType.IssuanceSingle, event)
        );

        this.provider.on(
            registry.filters.TransferSingle(null, null, null, null, null),
            (event: providers.Log) => this.processEvent(EventType.TransferSingle, event)
        );

        this.provider.on(
            registry.filters.ClaimSingle(null, null, null, null, null, null),
            (event: providers.Log) => this.processEvent(EventType.ClaimSingle, event)
        );
    }

    async processEvent(eventType: EventType, rawEvent: providers.Log): Promise<void> {
        const event = await CertificateUtils.decodeEvent(eventType, rawEvent, this.registry);

        // Allow some time for the backend controllers to finish processing
        // before processing blockchain events
        await sleep(2000);

        this.logger.log(
            `Detected a new event: ${eventType} on Certificate ${event._id.toNumber()}`
        );

        switch (eventType) {
            case EventType.IssuanceSingle:
                this.eventBus.publish(new CertificateCreatedEvent(event._id.toNumber()));
                break;

            case EventType.TransferSingle:
                this.eventBus.publish(new SyncCertificateEvent(event._id.toNumber()));
                break;

            case EventType.ClaimSingle:
                this.eventBus.publish(new SyncCertificateEvent(event._id.toNumber()));
                break;

            default:
                this.logger.log(
                    `No handlers found for event: ${eventType} on Certificate ${event._id.toNumber()}`
                );
        }
    }

    onApplicationShutdown(): void {
        this.provider = null;
    }
}
