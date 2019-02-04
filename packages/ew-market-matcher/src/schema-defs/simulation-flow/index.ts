import * as Sleep from './Sleep';
import * as Agreement from './RegisterAgreement';
import * as Date from './SetDate';
import * as ProducingAsset from './RegisterProducingAsset';
import * as Certificate from './RegisterCertificate';

interface SimulationFlow {
    flow: Array<
        Sleep.SleepAction |
        Agreement.RegisterAgreementAction |
        Date.SetDateAction |
        ProducingAsset.RegisterProducingAssetAction |
        Certificate.RegisterCertificateAction
    >;
    matcherAddress: string;
    expectedResult: Match[];
}

interface IdentifiableEntity {
    id: string;
}

interface Match {
    certificateId: string;
    agreementId: string;
    powerInW: number;
}

export {Sleep, Agreement, Date, ProducingAsset, Certificate, Match, IdentifiableEntity, SimulationFlow };