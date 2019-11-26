import { PurchasableCertificate } from '@energyweb/market';
import { Listener } from './Listener';

export interface ITimeTrigger {
    init(): void;
    registerCertificateListener(listener: Listener<PurchasableCertificate.Entity>): void;
}
