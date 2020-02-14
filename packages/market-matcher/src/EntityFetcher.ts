import { Demand, PurchasableCertificate, NoneCurrency } from '@energyweb/market';
import { Configuration } from '@energyweb/utils-general';
import polly from 'polly-js';

export interface IEntityFetcher {
    getDemandListLength(): Promise<number>;
    getCertificateListLength(): Promise<number>;

    getDemand(id: number, tries?: number): Promise<Demand.Entity>;
    getCertificate(id: string, tries?: number): Promise<PurchasableCertificate.Entity>;
}

export class EntityFetcher implements IEntityFetcher {
    constructor(private config: Configuration.Entity) {}

    getCertificateListLength() {
        return PurchasableCertificate.getCertificateListLength(this.config);
    }

    getDemandListLength() {
        return Demand.getDemandListLength(this.config);
    }

    getDemand(id: number, tries = 10) {
        return polly()
            .waitAndRetry(tries)
            .executeForPromise(() => this.fetchDemand(id));
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
            certificate.currency === NoneCurrency &&
            certificate.price === 0
        ) {
            throw new Error(`[Certificate #${id}] Missing settlement options`);
        }

        return certificate;
    }

    private async fetchDemand(id: number) {
        return new Demand.Entity(id, this.config).sync();
    }
}
