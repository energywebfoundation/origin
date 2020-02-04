import { Demand, PurchasableCertificate } from '@energyweb/market';
import { Listener } from './Listener';

export interface IEntityStore {
    init(): Promise<void>;
    registerCertificateListener(listener: Listener<PurchasableCertificate.Entity>): void;
    registerDemandListener(listener: Listener<Demand.Entity>): void;
    getDemand(id: number): Promise<Demand.Entity>;
    getDemands(): Demand.Entity[];
    getCertificates(): PurchasableCertificate.Entity[];
}
