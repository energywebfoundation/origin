import { Agreement, Demand, Supply } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import { Configuration, ContractEventHandler, EventHandlerManager } from '@energyweb/utils-general';
import { inject, singleton } from 'tsyringe';
import * as Winston from 'winston';

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

    private matcherAddress: string;

    private certificateListeners: Listener<Certificate.Entity>[] = [];

    private demandListeners: Listener<Demand.Entity>[] = [];

    constructor(
        @inject('config') private config: Configuration.Entity,
        @inject('logger') private logger: Winston.Logger
    ) {
        this.matcherAddress = config.blockchainProperties.activeUser.address.toLowerCase();
    }

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
    }

    private async triggerCertificateListeners(certificate: Certificate.Entity) {
        for (const listener of this.certificateListeners) {
            try {
                await listener(certificate);
            } catch (e) {
                this.logger.debug(`Certificate listener failed to execute: ${e}`);
            }
        }
    }

    private async triggerDemandListeners(demand: Demand.Entity) {
        for (const listener of this.demandListeners) {
            try {
                await listener(demand);
            } catch (e) {
                this.logger.debug(`Demand listener failed to execute: ${e}`);
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
            const newCertificate = await new Certificate.Entity(i.toString(), this.config).sync();

            await this.triggerCertificateListeners(newCertificate);
        }
    }

    private async subscribeToEvents() {
        const currentBlockNumber = await this.config.blockchainProperties.web3.eth.getBlockNumber();
        const certificateContractEventHandler = new ContractEventHandler(
            this.config.blockchainProperties.certificateLogicInstance,
            currentBlockNumber
        );

        certificateContractEventHandler.onEvent('LogPublishForSale', async (event: any) => {
            const { _entityId } = event.returnValues;
            this.logger.verbose(`Event: LogPublishForSale certificate #${_entityId}`);
            const newCertificate = await new Certificate.Entity(_entityId, this.config).sync();

            await this.triggerCertificateListeners(newCertificate);
        });

        certificateContractEventHandler.onEvent('LogCreatedCertificate', async (event: any) => {
            this.logger.verbose(
                `Event: LogCreatedCertificate certificate #${event.returnValues._certificateId}`
            );
            const newCertificate = await new Certificate.Entity(
                event.returnValues._certificateId,
                this.config
            ).sync();

            await this.triggerCertificateListeners(newCertificate);
        });

        certificateContractEventHandler.onEvent('LogCertificateSplit', async (event: any) => {
            const { _certificateId, _childOne, _childTwo } = event.returnValues;

            this.logger.verbose(
                `Event: LogCertificateSplit certificate #${_certificateId} children=[${_childOne}, ${_childTwo}]`
            );
            const firstChild = await new Certificate.Entity(_childOne, this.config).sync();
            const secondChild = await new Certificate.Entity(_childTwo, this.config).sync();

            await this.triggerCertificateListeners(firstChild);
            await this.triggerCertificateListeners(secondChild);
        });

        const marketContractEventHandler = new ContractEventHandler(
            this.config.blockchainProperties.marketLogicInstance,
            currentBlockNumber
        );

        marketContractEventHandler.onEvent('createdNewDemand', async (event: any) => {
            this.logger.verbose(
                `\n* Event: createdNewDemand demand: ${event.returnValues._demandId}`
            );
            const newDemand = await new Demand.Entity(
                event.returnValues._demandId,
                this.config
            ).sync();

            this.registerDemand(newDemand);
            await this.triggerDemandListeners(newDemand);
        });

        marketContractEventHandler.onEvent('createdNewSupply', async (event: any) => {
            this.logger.verbose(
                `\n* Event: createdNewSupply supply: ${event.returnValues._supplyId}`
            );
            const newSupply = await new Supply.Entity(
                event.returnValues._supplyId,
                this.config
            ).sync();

            this.registerSupply(newSupply);
        });

        marketContractEventHandler.onEvent('LogAgreementFullySigned', async (event: any) => {
            this.logger.verbose(
                `\n* Event: LogAgreementFullySigned - (Agreement, Demand, Supply) ID: (${event.returnValues._agreementId}, ${event.returnValues._demandId}, ${event.returnValues._supplyId})`
            );

            const newAgreement = await new Agreement.Entity(
                event.returnValues._agreementId,
                this.config
            ).sync();

            this.registerAgreement(newAgreement);
        });

        const eventHandlerManager = new EventHandlerManager(4000, this.config);
        eventHandlerManager.registerEventHandler(marketContractEventHandler);
        eventHandlerManager.registerEventHandler(certificateContractEventHandler);
        eventHandlerManager.start();
    }

    private registerDemand(demand: Demand.Entity) {
        if (this.demands.has(demand.id)) {
            return;
        }

        this.demands.set(demand.id, demand);
        this.logger.verbose(`Registered new demand #${demand.id}`);
    }

    private registerSupply(supply: Supply.Entity) {
        if (this.supplies.has(supply.id)) {
            return;
        }

        this.supplies.set(supply.id, supply);
        this.logger.verbose(`Registered new supply #${supply.id}`);
    }

    private registerAgreement(agreement: Agreement.Entity) {
        const allowed = agreement.allowedMatcher.some(
            matcherAddress => matcherAddress && matcherAddress.toLowerCase() === this.matcherAddress
        );

        if (!allowed) {
            this.logger.verbose(`This instance is not an matcher for agreement #${agreement.id}`);
        }

        if (this.agreements.has(agreement.id)) {
            return;
        }

        this.agreements.set(agreement.id, agreement);
        this.logger.verbose(`Registered new agreement #${agreement.id}`);
    }
}
