import { SleepAction } from "./Sleep";
import { RegisterDemandAction } from "./RegisterDemand";
import { SetDateAction } from "./SetDate";
import { RegisterProducingAssetAction } from "./RegisterProducingAsset";
import { RegisterCertificateAction } from "./RegisterCertificate";

export interface SimulationFlow {
    flow: (SleepAction | RegisterDemandAction | SetDateAction | RegisterProducingAssetAction | RegisterCertificateAction)[],
    matcherAddress: string
    expectedResult: Match[]
}

export interface IdentifiableEntity {
    id: number
}

export interface Match {
    certificateId: number
    demandId: number,
    powerInW: number,
    coSaved: number
}
