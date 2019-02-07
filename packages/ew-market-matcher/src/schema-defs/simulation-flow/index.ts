import * as Sleep from './Sleep';
import * as Agreement from './RegisterAgreement';
import * as Date from './SetDate';
import * as ProducingAsset from './RegisterProducingAsset';
import * as Certificate from './RegisterCertificate';
import * as Demand from './RegisterDemand';
import * as Supply from './RegisterSupply';



interface SimulationFlow {
    flow: Array<
        Sleep.SleepAction |
        Agreement.RegisterAgreementAction |
        Date.SetDateAction |
        ProducingAsset.RegisterProducingAssetAction |
        Certificate.RegisterCertificateAction |
        Supply.RegisterSupplyAction |
        Demand.RegisterDemandAction
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

export {
    Sleep,
    Agreement,
    Date,
    ProducingAsset,
    Certificate,
    Demand,
    Supply,
    Match,
    IdentifiableEntity, 
    SimulationFlow,
};