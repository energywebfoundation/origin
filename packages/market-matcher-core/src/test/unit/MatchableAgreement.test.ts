import { Agreement, Supply, Demand, PurchasableCertificate } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import { Substitute } from '@fluffy-spoon/substitute';
import { assert } from 'chai';

import { MatchableAgreement } from '../../MatchableAgreement';
import { MatchingErrorReason } from '../../MatchingErrorReason';

interface IMockOptions {
    deviceId?: string;
    certificateCreationTime?: number;
    isFilledDemand?: boolean;
}

describe('MatchableAgreement tests', () => {
    describe('Certificates', () => {
        const deviceId = '11';
        const agreementStart = new Date().getTime() - 100000;
        const agreementEnd = agreementStart + 100000 + 100000;
        const certificateCreationTime = agreementStart + 100000;

        const createMatchingMocks = (options: IMockOptions) => {
            const agreementOffChainProperties = Substitute.for<
                Agreement.IAgreementOffChainProperties
            >();
            agreementOffChainProperties.start.returns(agreementStart);
            agreementOffChainProperties.end.returns(agreementEnd);

            const agreement = Substitute.for<Agreement.IAgreement>();
            agreement.offChainProperties.returns(agreementOffChainProperties);

            const certificate = Substitute.for<PurchasableCertificate.IPurchasableCertificate>();
            certificate.certificate.returns({
                creationTime: options.certificateCreationTime || certificateCreationTime,
                deviceId: Number(options.deviceId || deviceId)
            } as Certificate.ICertificate);

            const supply = Substitute.for<Supply.ISupply>();
            supply.deviceId.returns(deviceId);

            const demand = Substitute.for<Demand.IDemand>();
            demand.id.returns(deviceId);
            demand
                .missingEnergyInCurrentPeriod()
                .returns(Promise.resolve({ time: 0, value: options.isFilledDemand ? 0 : 1000 }));

            return {
                agreement,
                certificate,
                supply,
                demand
            };
        };

        it('should match certificate', async () => {
            const { agreement, certificate, supply, demand } = createMatchingMocks({});

            const matchableAgreement = new MatchableAgreement(agreement);
            const { result } = await matchableAgreement.matchesCertificate(
                certificate,
                supply,
                demand
            );

            assert.isTrue(result);
        });

        it('should not match certificate with wrong device id', async () => {
            const { agreement, certificate, supply, demand } = createMatchingMocks({
                deviceId: '12'
            });

            const matchableAgreement = new MatchableAgreement(agreement);
            const { result, reason } = await matchableAgreement.matchesCertificate(
                certificate,
                supply,
                demand
            );

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.WRONG_DEVICE_ID);
        });

        it('should not match certificate with creation time outside agreement range', async () => {
            const { agreement, certificate, supply, demand } = createMatchingMocks({
                certificateCreationTime: agreementEnd + 1
            });

            const matchableAgreement = new MatchableAgreement(agreement);
            const { result, reason } = await matchableAgreement.matchesCertificate(
                certificate,
                supply,
                demand
            );

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.OUT_OF_RANGE);
        });

        it('should not match certificate when underlying demand is already filled', async () => {
            const { agreement, certificate, supply, demand } = createMatchingMocks({
                isFilledDemand: true
            });

            const matchableAgreement = new MatchableAgreement(agreement);
            const { result, reason } = await matchableAgreement.matchesCertificate(
                certificate,
                supply,
                demand
            );

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.PERIOD_ALREADY_FILLED);
        });
    });
});
