import { Agreement, Supply } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import { Substitute } from '@fluffy-spoon/substitute';
import { assert } from 'chai';

import { MatchableAgreement } from '../../MatchableAgreement';
import { MatchingErrorReason } from '../../MatchingErrorReason';

interface IMockOptions {
    assetId?: string;
    certificateCreationTime?: number;
}

describe('MatchableAgreement tests', () => {
    describe('Certificates', () => {
        const assetId = '11';
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

            const certificate = Substitute.for<Certificate.ICertificate>();
            certificate.creationTime.returns(
                options.certificateCreationTime || certificateCreationTime
            );
            certificate.assetId.returns(Number(options.assetId || assetId));

            const supply = Substitute.for<Supply.ISupply>();
            supply.assetId.returns(assetId);

            return {
                agreement,
                certificate,
                supply
            };
        };

        it('should match certificate', () => {
            const { agreement, certificate, supply } = createMatchingMocks({});

            const matchableAgreement = new MatchableAgreement(agreement);
            const { result } = matchableAgreement.matchesCertificate(certificate, supply);

            assert.isTrue(result);
        });

        it('should not match certificate with wrong asset id', () => {
            const { agreement, certificate, supply } = createMatchingMocks({ assetId: '12' });

            const matchableAgreement = new MatchableAgreement(agreement);
            const { result, reason } = matchableAgreement.matchesCertificate(certificate, supply);

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.WRONG_ASSET_ID);
        });

        it('should not match certificate with creation time outside agreement range', () => {
            const { agreement, certificate, supply } = createMatchingMocks({
                certificateCreationTime: agreementEnd + 1
            });

            const matchableAgreement = new MatchableAgreement(agreement);
            const { result, reason } = matchableAgreement.matchesCertificate(certificate, supply);

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.OUT_OF_RANGE);
        });
    });
});
