import { Agreement, Demand, Supply, PurchasableCertificate } from '@energyweb/market';
import {
    Configuration,
    ContractEventHandler,
    EventHandlerManager,
    Currency
} from '@energyweb/utils-general';
import { inject, singleton } from 'tsyringe';
import * as Winston from 'winston';
import polly from 'polly-js';
import { Listener } from './Matcher';
import { EntityListener } from './EntityListener';

export interface IEntityStore {
    init(): Promise<void>;
    registerCertificateListener(listener: Listener<PurchasableCertificate.Entity>): void;
    registerDemandListener(listener: Listener<Demand.Entity>): void;

    getDemand(id: string): Promise<Demand.Entity>;
    getSupply(id: string): Promise<Supply.Entity>;

    getAgreements(): Agreement.Entity[];
    getDemands(): Demand.Entity[];
    getCertificates(): PurchasableCertificate.Entity[];
}

@singleton()
export class EntityStore implements IEntityStore {
    private demands: Map<string, Demand.Entity> = new Map<string, Demand.Entity>();

    private supplies: Map<string, Supply.Entity> = new Map<string, Supply.Entity>();

    private agreements: Map<string, Agreement.Entity> = new Map<string, Agreement.Entity>();

    private certificates: Map<string, PurchasableCertificate.Entity> = new Map<
        string,
        PurchasableCertificate.Entity
    >();

    private certificateListeners: EntityListener<PurchasableCertificate.Entity>;

    private demandListeners: EntityListener<Demand.Entity>;

    constructor(
        @inject('config') private config: Configuration.Entity,
        @inject('logger') private logger: Winston.Logger
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

    public async getDemand(id: string): Promise<Demand.Entity> {
        if (!this.demands.has(id)) {
            const demand = await new Demand.Entity(id, this.config).sync();

            this.demands.set(id, demand);
        }

        return this.demands.get(id);
    }

    public async getSupply(id: string): Promise<Supply.Entity> {
        if (!this.supplies.has(id)) {
            const supply = await new Supply.Entity(id, this.config).sync();

            this.supplies.set(id, supply);
        }

        return this.supplies.get(id);
    }

    public getAgreements() {
        return Array.from(this.agreements.values());
    }

    public getDemands() {
        return Array.from(this.demands.values());
    }

    public getCertificates() {
        return Array.from(this.certificates.values());
    }

    public async init() {
        await this.syncExistingEvents();
        await this.subscribeToEvents();
        await this.triggerExistingEvents();
    }

    private async triggerExistingEvents() {
        const certificates = this.getCertificates();
        certificates.forEach(certificate => this.certificateListeners.trigger(certificate));

        const demands = this.getDemands();
        demands.forEach(demand => this.demandListeners.trigger(demand));
    }

    private async syncExistingEvents() {
        this.logger.verbose('* Getting all active agreements');
        const agreementListLength = await Agreement.getAgreementListLength(this.config);
        for (let i = 0; i < agreementListLength; i++) {
            await this.registerAgreement(i.toString());
        }

        this.logger.verbose('* Getting all active demands');
        const demandListLength = await Demand.getDemandListLength(this.config);
        for (let i = 0; i < demandListLength; i++) {
            await this.handleDemand(i.toString(), false);
        }

        this.logger.verbose('* Getting all active supplies');
        const supplyListLength = await Supply.getSupplyListLength(this.config);
        for (let i = 0; i < supplyListLength; i++) {
            await this.registerSupply(i.toString());
        }

        this.logger.verbose('* Getting all certificates');
        const certificateListLength = await PurchasableCertificate.getCertificateListLength(
            this.config
        );
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
        this.registerToSupplyEvents(marketContractEventHandler);
        this.registerToAgreementEvents(marketContractEventHandler);

        const eventHandlerManager = new EventHandlerManager(4000, this.config);
        eventHandlerManager.registerEventHandler(marketContractEventHandler);
        eventHandlerManager.registerEventHandler(certificateContractEventHandler);
        eventHandlerManager.start();
    }

    private registerToCertificateEvents(certificateContractEventHandler: ContractEventHandler) {
        certificateContractEventHandler.onEvent('LogPublishForSale', async (event: any) => {
            const { _certificateId: id } = event.returnValues;
            this.logger.verbose(`Event: LogPublishForSale certificate #${id}`);

            await this.handleCertificate(id);
        });

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

    private registerToAgreementEvents(marketContractEventHandler: ContractEventHandler) {
        marketContractEventHandler.onEvent('LogAgreementFullySigned', async (event: any) => {
            const { _agreementId: id, _demandId, _supplyId } = event.returnValues;

            this.logger.verbose(
                `Event: LogAgreementFullySigned - (Agreement, Demand, Supply) ID: (${id}, ${_demandId}, ${_supplyId})`
            );

            await this.registerAgreement(id);
        }); // TODO: agreement should be signed before can be respected
    }

    private registerToSupplyEvents(marketContractEventHandler: ContractEventHandler) {
        marketContractEventHandler.onEvent('createdNewSupply', async (event: any) => {
            const { _supplyId: id } = event.returnValues;

            this.logger.verbose(`Event: createdNewSupply supply: ${id}`);

            await this.registerSupply(id);
        });
    }

    private registerToDemandEvents(marketContractEventHandler: ContractEventHandler) {
        marketContractEventHandler.onEvent('createdNewDemand', async (event: any) => {
            this.logger.verbose(`Event: createdNewDemand demand: ${event.returnValues._demandId}`);

            await this.handleDemand(event.returnValues._demandId);
        });

        marketContractEventHandler.onEvent('DemandStatusChanged', async (event: any) => {
            this.logger.verbose(
                `Event: DemandStatusChanged demand: ${event.returnValues._demandId}`
            );

            await this.handleDemand(event.returnValues._demandId);
        });
    }

    private async handleDemand(id: string, trigger = true) {
        const demand = await polly()
            .waitAndRetry(10)
            .executeForPromise(() => new Demand.Entity(id, this.config).sync());

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

    private async registerSupply(id: string) {
        const supply = await polly()
            .waitAndRetry(10)
            .executeForPromise(() => new Supply.Entity(id, this.config).sync());

        this.supplies.set(supply.id, supply);
        this.logger.verbose(`Registered new supply #${supply.id}`);
    }

    private async registerAgreement(id: string) {
        const agreement = await polly()
            .waitAndRetry(10)
            .executeForPromise(() => new Agreement.Entity(id, this.config).sync());

        this.agreements.set(agreement.id, agreement);
        this.logger.verbose(`[Agreement ${agreement.id}] Registered`);
    }

    private async handleCertificate(id: string, trigger = true) {
        const certificate = await this.pollCertificate(id);

        this.certificates.set(certificate.id, certificate);
        this.logger.verbose(`[Certificate ${certificate.id}] Registered`);

        if (trigger) {
            this.certificateListeners.trigger(certificate);
        }
    }

    private async fetchCertificate(id: string) {
        const certificate = await new PurchasableCertificate.Entity(id, this.config).sync();

        if (
            certificate.forSale &&
            certificate.isOffChainSettlement &&
            certificate.currency === Currency.NONE &&
            certificate.price === 0
        ) {
            throw new Error(`[Certificate #${id}] Missing settlement options`);
        }

        return certificate;
    }

    private pollCertificate(id: string) {
        return polly()
            .waitAndRetry(10)
            .executeForPromise(() => this.fetchCertificate(id));
    }
}
