import 'reflect-metadata';
import { Substitute } from '@fluffy-spoon/substitute';
import * as Winston from 'winston';
import { assert } from 'chai';

import { PurchasableCertificate } from '@energyweb/market';
import * as lolex from 'lolex';
import { IEntityStore } from '../../EntityStore';
import { TimeTrigger } from '../../TimeTrigger';

describe('TimeTrigger tests', () => {
    const idOne = '0';
    const idTwo = '1';

    const createTimeTrigger = (certificatesId: string[], intervalInMinutes: number) => {
        const certificatesMocks = certificatesId.map(id => {
            const certificateMock = Substitute.for<PurchasableCertificate.Entity>();
            certificateMock.id.returns(id);
            return certificateMock;
        });

        const entityStore = Substitute.for<IEntityStore>();
        entityStore.getCertificates().returns(certificatesMocks);

        const logger = Substitute.for<Winston.Logger>();

        return new TimeTrigger(entityStore, logger, intervalInMinutes);
    };

    it('should issue initial trigger', done => {
        const intervalInMinutes = 5;

        const timeTrigger = createTimeTrigger([idOne, idTwo], intervalInMinutes);
        const triggeredCertificates: PurchasableCertificate.Entity[] = [];

        timeTrigger.registerCertificateListener(certificate => {
            triggeredCertificates.push(certificate);

            if (triggeredCertificates.length === 2) {
                assert.equal(triggeredCertificates.pop().id, idTwo);
                assert.equal(triggeredCertificates.pop().id, idOne);
                done();
            }
        });

        const clock = lolex.install();

        timeTrigger.init();

        // initialTimeout will return 0 and lolex will not execute setTimeout for 1st time
        // so we need to tick the clock
        clock.tick(1);
        clock.uninstall();
    });

    it('should issue initial trigger and 2nd trigger', done => {
        const nextIntervalInMinutes = 5;

        const timeTrigger = createTimeTrigger([idOne, idTwo], nextIntervalInMinutes);
        const triggeredCertificates: PurchasableCertificate.Entity[] = [];

        timeTrigger.registerCertificateListener(certificate => {
            triggeredCertificates.push(certificate);
            if (triggeredCertificates.length === 4) {
                assert.equal(triggeredCertificates.pop().id, idTwo);
                assert.equal(triggeredCertificates.pop().id, idOne);
                done();
            }
        });
        const clock = lolex.install();

        timeTrigger.init();

        clock.tick(1);
        clock.tick(5 * 60 * 1000);
        clock.uninstall();
    });
});
