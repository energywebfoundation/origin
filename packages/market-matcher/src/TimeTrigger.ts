import { injectable, inject } from 'tsyringe';
import { Certificate } from '@energyweb/origin';
import moment from 'moment';
import * as Winston from 'winston';
import { IEntityStore } from './EntityStore';
import { Listener } from './Matcher';
import { EntityListener } from './EntityListener';

export interface ITimeTrigger {
    init(): void;
    registerCertificateListener(listener: Listener<Certificate.Entity>): void;
}

@injectable()
export class TimeTrigger implements ITimeTrigger {
    private certificateListeners: EntityListener<Certificate.Entity>;

    constructor(
        @inject('entityStore') private entityStore: IEntityStore,
        @inject('logger') private logger: Winston.Logger,
        @inject('interval') private interval: number
    ) {
        this.certificateListeners = new EntityListener<Certificate.Entity>(this.logger);
    }

    public init() {
        this.trigger(this.initialTimeout);
    }

    public registerCertificateListener(listener: Listener<Certificate.Entity>) {
        this.certificateListeners.register(listener);
    }

    private get initialTimeout() {
        const now = moment();
        const roundedUp = Math.ceil(now.minute() / this.interval) * this.interval;
        const next = now
            .clone()
            .minute(roundedUp)
            .second(0);

        this.logger.verbose(`TimeTrigger: next trigger scheduled to ${next.toISOString()}`);
        return (next.unix() - now.unix()) * 1000;
    }

    private trigger(timeout: number = this.interval * 60 * 1000) {
        setTimeout(() => {
            this.triggerCertificates();
            this.trigger();
        }, timeout);
    }

    private triggerCertificates() {
        this.logger.verbose(`TimeTrigger: starting certificates triggering`);
        const certificates = this.entityStore.getCertificates();

        this.logger.verbose(`TimeTrigger: found ${certificates.length} certificates`);

        certificates.forEach(certificate => this.certificateListeners.trigger(certificate));

        this.logger.verbose(`TimeTrigger: finished certificates triggering`);
    }
}
