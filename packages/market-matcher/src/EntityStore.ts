import { Demand, PurchasableCertificate } from '@energyweb/market';
import { EntityListener, IEntityStore, Listener } from '@energyweb/market-matcher-core';
import { Configuration, ContractEventHandler, EventHandlerManager } from '@energyweb/utils-general';
import * as Winston from 'winston';

import { IEntityFetcher } from './EntityFetcher';

export class EntityStore implements IEntityStore {
    private demands: Map<number, Demand.Entity> = new Map<number, Demand.Entity>();

    private certificates: Map<string, PurchasableCertificate.Entity> = new Map<
        string,
        PurchasableCertificate.Entity
    >();

    private certificateListeners: EntityListener<PurchasableCertificate.Entity>;

    private demandListeners: EntityListener<Demand.Entity>;

    private demandEvents = ['createdNewDemand', 'DemandStatusChanged', 'DemandUpdated'];

    private certificateEvents = ['LogPublishForSale', 'LogUnpublishForSale'];

    constructor(
        private config: Configuration.Entity,
        private logger: Winston.Logger,
        private fetcher: IEntityFetcher
    ) {
        this.certificateListeners = new EntityListener<PurchasableCertificate.Entity>(this.logger);
        this.demandListeners = new EntityListener<Demand.Entity>(this.logger);
    }

    public registerCertificateListener(listener: Listener<PurchasableCertificate.Entity>) {
        this.certificateListeners.register(listener);
    }

    public registerDemandListener(listener: Listener<Demand.Entity>) {
        this.demandListeners.register(listener);
    }

    public async getDemand(id: number): Promise<Demand.Entity> {
        if (!this.demands.has(id)) {
            const demand = await this.fetcher.getDemand(id, 1);

            this.demands.set(id, demand);
        }

        return this.demands.get(id);
    }

    public getDemands() {
        return Array.from(this.demands.values());
    }

    public getCertificates() {
        return Array.from(this.certificates.values());
    }

    public async init(watchEvents = true) {
        await this.syncExistingEvents();

        if (watchEvents) {
            await this.subscribeToEvents();
        }

        await this.triggerExistingEvents();
    }

    private async triggerExistingEvents() {
        const certificates = this.getCertificates();
        certificates.forEach(certificate => this.certificateListeners.trigger(certificate));

        const demands = this.getDemands();
        demands.forEach(demand => this.demandListeners.trigger(demand));
    }

    private async syncExistingEvents() {
        this.logger.verbose('* Getting all active demands');
        const demandListLength = await this.fetcher.getDemandListLength();
        for (let i = 1; i <= demandListLength; i++) {
            await this.handleDemand(i, false);
        }

        this.logger.verbose('* Getting all certificates');
        const certificateListLength = await this.fetcher.getCertificateListLength();
        for (let i = 0; i < certificateListLength; i++) {
            await this.handleCertificate(i.toString(), false);
        }
    }

    private async subscribeToEvents() {
        const currentBlockNumber = await this.config.blockchainProperties.web3.eth.getBlockNumber();

        const certificateContractEventHandler = new ContractEventHandler(
            this.config.blockchainProperties.certificateLogicInstance,
            currentBlockNumber
        );

        this.registerToCertificateEvents(certificateContractEventHandler);

        const marketContractEventHandler = new ContractEventHandler(
            this.config.blockchainProperties.marketLogicInstance,
            currentBlockNumber
        );

        this.registerToDemandEvents(marketContractEventHandler);
        this.registerToPurchasableCertificateEvents(marketContractEventHandler);

        const eventHandlerManager = new EventHandlerManager(4000, this.config);
        eventHandlerManager.registerEventHandler(marketContractEventHandler);
        eventHandlerManager.registerEventHandler(certificateContractEventHandler);
        eventHandlerManager.start();
    }

    private registerToCertificateEvents(certificateContractEventHandler: ContractEventHandler) {
        certificateContractEventHandler.onEvent('LogCreatedCertificate', async (event: any) => {
            const { _certificateId: id } = event.returnValues;
            this.logger.verbose(`Event: LogCreatedCertificate certificate #${id}`);

            await this.handleCertificate(id);
        });

        certificateContractEventHandler.onEvent('LogCertificateSplit', async (event: any) => {
            const { _certificateId: id, _childOne, _childTwo } = event.returnValues;

            this.logger.verbose(
                `Event: LogCertificateSplit certificate #${id} children=[${_childOne}, ${_childTwo}]`
            );

            await this.handleCertificate(_childOne);
            await this.handleCertificate(_childTwo);

            // TODO: handle original certificate
        });
    }

    private registerToPurchasableCertificateEvents(
        marketContractEventHandler: ContractEventHandler
    ) {
        this.certificateEvents.forEach(eventName => {
            marketContractEventHandler.onEvent(eventName, async (event: any) => {
                const { _certificateId: id } = event.returnValues;
                this.logger.verbose(`Event: ${eventName} certificate #${id}`);

                await this.handleCertificate(id);
            });
        });
    }

    private registerToDemandEvents(marketContractEventHandler: ContractEventHandler) {
        this.demandEvents.forEach(eventName => {
            marketContractEventHandler.onEvent(eventName, async (event: any) => {
                const { _demandId: id } = event.returnValues;
                this.logger.verbose(`Event: ${eventName} demand: ${id}`);

                await this.handleDemand(id);
            });
        });
    }

    private async handleDemand(id: number, trigger = true) {
        const demand = await this.fetcher.getDemand(id);

        console.log({ demand });

        if (!demand.automaticMatching) {
            this.logger.verbose(
                `[Demand ${demand.id}] Skipped. Does not allow automatic matching.`
            );
            return;
        }

        const isFulfilled = await demand.isFulfilled();
        if (isFulfilled) {
            this.logger.verbose(`[Demand ${demand.id}] is already filled.`);
            if (this.demands.has(demand.id)) {
                this.demands.delete(demand.id);
                this.logger.verbose(`[Demand ${demand.id}] Removed from the store.`);
            }
            return;
        }

        this.demands.set(demand.id, demand);
        this.logger.verbose(`[Demand ${demand.id}] Registered`);

        if (trigger) {
            this.demandListeners.trigger(demand);
        }
    }

    private async handleCertificate(id: string, trigger = true) {
        const certificate = await this.fetcher.getCertificate(id);

        if (certificate.certificate.children.length) {
            this.logger.verbose(`[Certificate ${certificate.id}] Is parent certificate, skipping.`);
            return;
        }

        this.certificates.set(certificate.id, certificate);
        this.logger.verbose(`[Certificate ${certificate.id}] Registered`);

        if (trigger) {
            this.certificateListeners.trigger(certificate);
        }
    }
}
