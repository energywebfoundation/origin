import { Agreement, Demand, Supply } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import {
    Configuration,
    ContractEventHandler,
    EventHandlerManager,
    Currency
} from '@energyweb/utils-general';
import { inject, singleton } from 'tsyringe';
import * as Winston from 'winston';
import polly from 'polly-js';

export interface IEntityStore {
    init(): Promise<void>;
    registerCertificateListener(listener: Listener<Certificate.Entity>): void;
    registerDemandListener(listener: Listener<Demand.Entity>): void;

    getDemandById(id: string): Demand.Entity;
    getAgreements(): Agreement.Entity[];
    getDemands(): Demand.Entity[];
    getCertificates(): Certificate.Entity[];
}

export type Listener<T> = (entity: T) => Promise<void>;

@singleton()
export class EntityStore implements IEntityStore {
    private demands: Map<string, Demand.Entity> = new Map<string, Demand.Entity>();

    private supplies: Map<string, Supply.Entity> = new Map<string, Supply.Entity>();

    private agreements: Map<string, Agreement.Entity> = new Map<string, Agreement.Entity>();

    private certificates: Map<string, Certificate.Entity> = new Map<string, Certificate.Entity>();

    private certificateListeners: Listener<Certificate.Entity>[] = [];

    private demandListeners: Listener<Demand.Entity>[] = [];

    constructor(
        @inject('config') private config: Configuration.Entity,
        @inject('logger') private logger: Winston.Logger
    ) {}

    public registerCertificateListener(listener: Listener<Certificate.Entity>) {
        this.certificateListeners.push(listener);
    }

    public registerDemandListener(listener: Listener<Demand.Entity>) {
        this.demandListeners.push(listener);
    }

    public getDemandById(id: string): Demand.Entity {
        return this.demands.get(id);
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
        for (const certificate of certificates) {
            await this.triggerCertificateListeners(certificate);
        }

        const demands = this.getDemands();
        for (const demand of demands) {
            await this.triggerDemandListeners(demand);
        }
    }

    private async triggerCertificateListeners(certificate: Certificate.Entity) {
        for (const listener of this.certificateListeners) {
            try {
                await listener(certificate);
            } catch (e) {
                this.logger.error(`Certificate listener failed to execute: ${e}`);
            }
        }
    }

    private async triggerDemandListeners(demand: Demand.Entity) {
        for (const listener of this.demandListeners) {
            try {
                await listener(demand);
            } catch (e) {
                this.logger.error(`Demand listener failed to execute: ${e}`);
            }
        }
    }

    private async syncExistingEvents() {
        this.logger.verbose('* Getting all active agreements');
        const agreementListLength = await Agreement.getAgreementListLength(this.config);
        for (let i = 0; i < agreementListLength; i++) {
            this.registerAgreement(await new Agreement.Entity(i.toString(), this.config).sync());
        }

        this.logger.verbose('* Getting all active demands');
        const demandListLength = await Demand.getDemandListLength(this.config);
        for (let i = 0; i < demandListLength; i++) {
            this.registerDemand(await new Demand.Entity(i.toString(), this.config).sync());
        }

        this.logger.verbose('* Getting all active supplies');
        const supplyListLength = await Supply.getSupplyListLength(this.config);
        for (let i = 0; i < supplyListLength; i++) {
            this.registerSupply(await new Supply.Entity(i.toString(), this.config).sync());
        }

        this.logger.verbose('* Getting all certificates');
        const certificateListLength = await Certificate.getCertificateListLength(this.config);
        for (let i = 0; i < certificateListLength; i++) {
            this.registerCertificate(
                await new Certificate.Entity(i.toString(), this.config).sync()
            );
        }
    }

    private async subscribeToEvents() {
        const currentBlockNumber = await this.config.blockchainProperties.web3.eth.getBlockNumber();
        const certificateContractEventHandler = new ContractEventHandler(
            this.config.blockchainProperties.certificateLogicInstance,
            currentBlockNumber
        );

        const fetchCertificate = async (certificateId: string) => {
            const certificate = await new Certificate.Entity(certificateId, this.config).sync();
            const { offChainSettlementOptions } = certificate;

            if (
                certificate.forSale &&
                offChainSettlementOptions.currency === Currency.NONE &&
                offChainSettlementOptions.price === 0
            ) {
                throw new Error(`[Certificate #${certificateId}] Missing settlement options`);
            }

            return certificate;
        };

        certificateContractEventHandler.onEvent('LogPublishForSale', async (event: any) => {
            const { _entityId } = event.returnValues;
            this.logger.verbose(`Event: LogPublishForSale certificate #${_entityId}`);

            const newCertificate = await polly()
                .waitAndRetry(10)
                .executeForPromise(() => fetchCertificate(_entityId));

            this.registerCertificate(newCertificate);
            await this.triggerCertificateListeners(newCertificate);
        });

        certificateContractEventHandler.onEvent('LogCreatedCertificate', async (event: any) => {
            this.logger.verbose(
                `Event: LogCreatedCertificate certificate #${event.returnValues._certificateId}`
            );

            const newCertificate = await polly()
                .waitAndRetry(10)
                .executeForPromise(() => fetchCertificate(event.returnValues._certificateId));

            this.registerCertificate(newCertificate);
            await this.triggerCertificateListeners(newCertificate);
        });

        certificateContractEventHandler.onEvent('LogCertificateSplit', async (event: any) => {
            const { _certificateId, _childOne, _childTwo } = event.returnValues;

            this.logger.verbose(
                `Event: LogCertificateSplit certificate #${_certificateId} children=[${_childOne}, ${_childTwo}]`
            );

            const firstChild = await polly()
                .waitAndRetry(10)
                .executeForPromise(() => fetchCertificate(_childOne));

            const secondChild = await polly()
                .waitAndRetry(10)
                .executeForPromise(() => fetchCertificate(_childTwo));

            this.registerCertificate(firstChild);
            this.registerCertificate(secondChild);

            await this.triggerCertificateListeners(firstChild);
            await this.triggerCertificateListeners(secondChild);
        });

        const marketContractEventHandler = new ContractEventHandler(
            this.config.blockchainProperties.marketLogicInstance,
            currentBlockNumber
        );

        marketContractEventHandler.onEvent('createdNewDemand', async (event: any) => {
            this.logger.verbose(`Event: createdNewDemand demand: ${event.returnValues._demandId}`);

            const newDemand = await polly()
                .waitAndRetry(10)
                .executeForPromise(() =>
                    new Demand.Entity(event.returnValues._demandId, this.config).sync()
                );

            this.registerDemand(newDemand);
            await this.triggerDemandListeners(newDemand);
        });

        marketContractEventHandler.onEvent('createdNewSupply', async (event: any) => {
            this.logger.verbose(`Event: createdNewSupply supply: ${event.returnValues._supplyId}`);

            const newSupply = await polly()
                .waitAndRetry(10)
                .executeForPromise(() =>
                    new Supply.Entity(event.returnValues._supplyId, this.config).sync()
                );

            this.registerSupply(newSupply);
        });

        marketContractEventHandler.onEvent('DemandStatusChanged', async (event: any) => {
            this.logger.verbose(
                `Event: DemandStatusChanged demand: ${event.returnValues._demandId}`
            );

            const newDemand = await polly()
                .waitAndRetry(10)
                .executeForPromise(() =>
                    new Demand.Entity(event.returnValues._demandId, this.config).sync()
                );

            this.updateDemand(newDemand);
        });

        marketContractEventHandler.onEvent('LogAgreementFullySigned', async (event: any) => {
            this.logger.verbose(
                `Event: LogAgreementFullySigned - (Agreement, Demand, Supply) ID: (${event.returnValues._agreementId}, ${event.returnValues._demandId}, ${event.returnValues._supplyId})`
            );

            const newAgreement = await polly()
                .waitAndRetry(10)
                .executeForPromise(() =>
                    new Agreement.Entity(event.returnValues._agreementId, this.config).sync()
                );

            this.registerAgreement(newAgreement);
        });

        const eventHandlerManager = new EventHandlerManager(4000, this.config);
        eventHandlerManager.registerEventHandler(marketContractEventHandler);
        eventHandlerManager.registerEventHandler(certificateContractEventHandler);
        eventHandlerManager.start();
    }

    private registerDemand(demand: Demand.Entity) {
        if (this.demands.has(demand.id)) {
            this.logger.verbose(`[Demand ${demand.id}] Already registered`);
            return;
        }

        this.demands.set(demand.id, demand);
        this.logger.verbose(`[Demand ${demand.id}] Registered`);
    }

    private updateDemand(demand: Demand.Entity) {
        if (!this.demands.has(demand.id)) {
            this.registerDemand(demand);
            return;
        }

        this.demands.set(demand.id, demand);
        this.logger.verbose(`Updated demand #${demand.id}`);
    }

    private registerSupply(supply: Supply.Entity) {
        if (this.supplies.has(supply.id)) {
            this.logger.verbose(`Supply with ID ${supply.id} has already been registered.`);
            return;
        }

        this.supplies.set(supply.id, supply);
        this.logger.verbose(`Registered new supply #${supply.id}`);
    }

    private registerAgreement(agreement: Agreement.Entity) {
        if (this.agreements.has(agreement.id)) {
            this.logger.verbose(`[Agreement ${agreement.id}] Already registered`);
            return;
        }

        this.agreements.set(agreement.id, agreement);
        this.logger.verbose(`[Agreement ${agreement.id}] Registered`);
    }

    private registerCertificate(certificate: Certificate.Entity) {
        if (this.certificates.has(certificate.id)) {
            this.logger.verbose(`[Certificate ${certificate.id}] Already registered`);
            return;
        }

        this.certificates.set(certificate.id, certificate);
        this.logger.verbose(`[Certificate ${certificate.id}] Registered`);
    }
}
