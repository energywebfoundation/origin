import 'reflect-metadata';
import { Agreement, Demand, Supply, PurchasableCertificate } from '@energyweb/market';
import { Configuration, Currency } from '@energyweb/utils-general';
import { inject, singleton } from 'tsyringe';
import polly from 'polly-js';

export interface IEntityFetcher {
    getAgreementListLength(): Promise<number>;
    getDemandListLength(): Promise<number>;
    getSupplyListLength(): Promise<number>;
    getCertificateListLength(): Promise<number>;

    getAgreement(id: string, tries?: number): Promise<Agreement.Entity>;
    getDemand(id: string, tries?: number): Promise<Demand.Entity>;
    getSupply(id: string, tries?: number): Promise<Supply.Entity>;
    getCertificate(id: string, tries?: number): Promise<PurchasableCertificate.Entity>;
}

@singleton()
export class EntityFetcher implements IEntityFetcher {
    constructor(@inject('config') private config: Configuration.Entity) {}

    getAgreementListLength() {
        return Agreement.getAgreementListLength(this.config);
    }

    getCertificateListLength() {
        return PurchasableCertificate.getCertificateListLength(this.config);
    }

    getDemandListLength() {
        return Demand.getDemandListLength(this.config);
    }

    getSupplyListLength() {
        return Supply.getSupplyListLength(this.config);
    }

    getAgreement(id: string, tries = 10) {
        return polly()
            .waitAndRetry(tries)
            .executeForPromise(() => this.fetchAgreement(id));
    }

    getDemand(id: string, tries = 10) {
        return polly()
            .waitAndRetry(tries)
            .executeForPromise(() => this.fetchDemand(id));
    }

    getSupply(id: string, tries = 10) {
        return polly()
            .waitAndRetry(tries)
            .executeForPromise(() => this.fetchSupply(id));
    }

    getCertificate(id: string, tries = 10) {
        return polly()
            .waitAndRetry(tries)
            .executeForPromise(() => this.fetchCertificate(id));
    }

    private async fetchCertificate(id: string): Promise<PurchasableCertificate.Entity> {
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

    private async fetchAgreement(id: string) {
        return new Agreement.Entity(id, this.config).sync();
    }

    private async fetchSupply(id: string) {
        return new Supply.Entity(id, this.config).sync();
    }

    private async fetchDemand(id: string) {
        return new Demand.Entity(id, this.config).sync();
    }
}
