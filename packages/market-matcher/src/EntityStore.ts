import { Agreement, Demand, Supply } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import { Configuration, ContractEventHandler, EventHandlerManager } from '@energyweb/utils-general';
import { EventEmitter } from 'events';
import { autoInjectable, inject } from 'tsyringe';
import * as Winston from 'winston';

export interface IEntityStore {
    init(): Promise<void>;
    registerCertificateListener(listener: (certificate: Certificate.Entity) => void): void;

    getDemandById(id: string): Demand.Entity;
    getAgreements(): Agreement.Entity[];
    getDemands(): Demand.Entity[];
}

@autoInjectable()
export class EntityStore implements IEntityStore {
    private demands: Map<string, Demand.Entity> = new Map<string, Demand.Entity>();
    private supplies: Map<string, Supply.Entity> = new Map<string, Supply.Entity>();
    private agreements: Map<string, Agreement.Entity> = new Map<string, Agreement.Entity>();
    private matcherAddress: string;

    private certificateEventEmitter = new EventEmitter();
    private readonly NEW_CERTIFICATE_EVENT_NAME = 'new-cert-event';

    constructor(
        @inject('config') private config?: Configuration.Entity,
        @inject('logger') private logger?: Winston.Logger
    ) {
        this.matcherAddress = config.blockchainProperties.activeUser.address.toLowerCase();
    }

    public registerCertificateListener(listener: (certificate: Certificate.Entity) => void) {
        this.certificateEventEmitter.addListener(this.NEW_CERTIFICATE_EVENT_NAME, listener);
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

    public async init() {
        await this.syncExistingEvents();
        await this.subscribeToEvents();
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
            
            this.certificateEventEmitter.emit(this.NEW_CERTIFICATE_EVENT_NAME, newCertificate);
        }
    }

    private async subscribeToEvents() {
        const currentBlockNumber = await this.config.blockchainProperties.web3.eth.getBlockNumber();
        const certificateContractEventHandler = new ContractEventHandler(
            this.config.blockchainProperties.certificateLogicInstance,
            currentBlockNumber
        );

        certificateContractEventHandler.onEvent('LogCreatedCertificate', async (event: any) => {
            this.logger.verbose(
                'Event: LogCreatedCertificate certificate #' + event.returnValues._certificateId
            );
            const newCertificate = await new Certificate.Entity(
                event.returnValues._certificateId,
                this.config
            ).sync();

            this.certificateEventEmitter.emit(this.NEW_CERTIFICATE_EVENT_NAME, newCertificate);
        });

        const marketContractEventHandler = new ContractEventHandler(
            this.config.blockchainProperties.marketLogicInstance,
            currentBlockNumber
        );

        marketContractEventHandler.onEvent('createdNewDemand', async event => {
            this.logger.verbose(
                '\n* Event: createdNewDemand demand: ' + event.returnValues._demandId
            );
            const newDemand = await new Demand.Entity(
                event.returnValues._demandId,
                this.config
            ).sync();

            this.registerDemand(newDemand);
        });

        marketContractEventHandler.onEvent('createdNewSupply', async event => {
            this.logger.verbose(
                '\n* Event: createdNewSupply supply: ' + event.returnValues._supplyId
            );
            const newSupply = await new Supply.Entity(
                event.returnValues._supplyId,
                this.config
            ).sync();

            this.registerSupply(newSupply);
        });

        marketContractEventHandler.onEvent('LogAgreementFullySigned', async event => {
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
        this.logger.verbose('Registered new demand #' + demand.id);
    }

    private registerSupply(supply: Supply.Entity) {
        if (this.supplies.has(supply.id)) {
            return;
        }

        this.supplies.set(supply.id, supply);
        this.logger.verbose('Registered new supply #' + supply.id);
    }

    private registerAgreement(agreement: Agreement.Entity) {
        const allowed = agreement.allowedMatcher.some(
            matcherAddress => matcherAddress && matcherAddress.toLowerCase() === this.matcherAddress
        );

        if (!allowed) {
            this.logger.verbose('This instance is not an matcher for agreement #' + agreement.id);
        }

        if (this.agreements.has(agreement.id)) {
            return;
        }

        this.agreements.set(agreement.id, agreement);
        this.logger.verbose('Registered new agreement #' + agreement.id);
    }
}
