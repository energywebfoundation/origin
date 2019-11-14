import { Demand } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import { Subject } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';
import { inject, injectable } from 'tsyringe';
import * as Winston from 'winston';

import { CertificateMatcher } from './CertificateMatcher';
import { DemandMatcher } from './DemandMatcher';
import { IEntityStore } from './EntityStore';
import { ITimeTrigger } from './TimeTrigger';

export type Listener<T> = (entity: T) => void;

@injectable()
export class Matcher {
    private matchingQueue = new Subject<Certificate.Entity | Demand.Entity>();

    constructor(
        @inject('certificateMatcher') private certificateMatcher: CertificateMatcher,
        @inject('demandMatcher') private demandMatcher: DemandMatcher,
        @inject('entityStore') private entityStore: IEntityStore,
        @inject('timeTrigger') private timeTrigger: ITimeTrigger,
        @inject('logger') private logger: Winston.Logger
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

    private log(entity: Certificate.Entity | Demand.Entity) {
        const name = entity instanceof Certificate.Entity ? 'Certificate' : 'Demand';

        this.logger.verbose(`[${name} ${entity.id}] queued for matching`);
    }

    private async match(entity: Certificate.Entity | Demand.Entity) {
        if (entity instanceof Certificate.Entity) {
            return this.certificateMatcher.match(entity as Certificate.Entity);
        }
        return this.demandMatcher.match(entity as Demand.Entity);
    }
}
