import { Demand, PurchasableCertificate } from '@energyweb/market';
import { Subject } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';
import * as Winston from 'winston';

import {
    CertificateMatcher,
    DemandMatcher,
    IEntityStore,
    ITimeTrigger
} from '@energyweb/market-matcher-core';

export class Matcher {
    private matchingQueue = new Subject<PurchasableCertificate.Entity | Demand.Entity>();

    constructor(
        private certificateMatcher: CertificateMatcher,
        private demandMatcher: DemandMatcher,
        private entityStore: IEntityStore,
        private timeTrigger: ITimeTrigger,
        private logger: Winston.Logger
    ) {}

    public async init() {
        this.matchingQueue
            .pipe(tap(this.log.bind(this)), concatMap(this.match.bind(this)))
            .subscribe();

        this.entityStore.registerCertificateListener(
            this.matchingQueue.next.bind(this.matchingQueue)
        );
        this.entityStore.registerDemandListener(this.matchingQueue.next.bind(this.matchingQueue));
        await this.entityStore.init();

        this.timeTrigger.registerCertificateListener(
            this.matchingQueue.next.bind(this.matchingQueue)
        );
        this.timeTrigger.init();
    }

    private log(entity: PurchasableCertificate.Entity | Demand.Entity) {
        const name = entity instanceof PurchasableCertificate.Entity ? 'Certificate' : 'Demand';

        this.logger.verbose(`[${name} ${entity.id}] queued for matching`);
    }

    private async match(entity: PurchasableCertificate.Entity | Demand.Entity) {
        if (entity instanceof PurchasableCertificate.Entity) {
            return this.certificateMatcher.match(entity as PurchasableCertificate.Entity);
        }
        return this.demandMatcher.match(entity as Demand.Entity);
    }
}
