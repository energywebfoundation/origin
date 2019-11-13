import { Demand, PurchasableCertificate } from '@energyweb/market';
import { Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { inject, injectable } from 'tsyringe';

import { CertificateMatcher } from './CertificateMatcher';
import { DemandMatcher } from './DemandMatcher';
import { IEntityStore } from './EntityStore';

@injectable()
export class Matcher {
    private matchingQueue = new Subject();

    constructor(
        @inject('certificateMatcher') private certificateMatcher: CertificateMatcher,
        @inject('demandMatcher') private demandMatcher: DemandMatcher,
        @inject('entityStore') private entityStore: IEntityStore
    ) {}

    public async init() {
        this.matchingQueue.pipe(concatMap(this.match.bind(this))).subscribe();
        this.entityStore.registerCertificateListener(
            async (certificate: PurchasableCertificate.Entity) =>
                this.matchingQueue.next(certificate)
        );
        this.entityStore.registerDemandListener(async (demand: Demand.Entity) =>
            this.matchingQueue.next(demand)
        );
        await this.entityStore.init();
    }

    private async match(entity: PurchasableCertificate.Entity | Demand.Entity) {
        if (entity instanceof PurchasableCertificate.Entity) {
            return this.certificateMatcher.match(entity as PurchasableCertificate.Entity);
        }
        return this.demandMatcher.match(entity as Demand.Entity);
    }
}
