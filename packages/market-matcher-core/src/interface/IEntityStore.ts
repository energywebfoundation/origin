import { Agreement, Demand, Supply, PurchasableCertificate } from '@energyweb/market';
import { Listener } from './Listener';

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
