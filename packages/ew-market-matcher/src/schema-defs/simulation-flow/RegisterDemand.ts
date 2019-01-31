
import { IdentifiableEntity } from './index';

export interface DemandData extends EwfCoo.FullDemandProperties, IdentifiableEntity {
    demandMask: number,
    productionLastSetInPeriod: number,
    currentWhPerPeriod: number
}

export interface RegisterDemandAction {
    type: RegisterDemandActionType,
    data: DemandData
}

export enum RegisterDemandActionType {
    RegisterDemand = "REGISTER_DEMAND"
}
