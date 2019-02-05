import * as EwMarket from 'ew-market-lib';
import { IdentifiableEntity } from '.';

export interface DemandData extends IdentifiableEntity {
    offChainProperties: EwMarket.Demand.DemandOffchainproperties;
    onChainProperties: EwMarket.Demand.DemandOnChainProperties;
}

export interface RegisterDemandAction {
    type: RegisterDemandActionType;
    data: DemandData;
}

export enum RegisterDemandActionType {
    RegisterDemand = 'REGISTER_DEMAND',
}

export const demandDataToEntity = (demandData: DemandData): EwMarket.Demand.Entity => {
    const demand = new EwMarket.Demand.Entity(demandData.id, null);
    demand.offChainProperties = demandData.offChainProperties;   
    Object.keys(demandData.onChainProperties)
        .forEach((key: string) => demand[key] = demandData.onChainProperties[key]);
    return demand;

};

const test: DemandData = {
    id: '99',
    offChainProperties: {
        timeframe: 0,
        pricePerCertifiedWh: 0,
        currency: 0,
        targetWhPerPeriod: 10,

    },
    onChainProperties: {
        demandOwner: '0x0',
        propertiesDocumentHash: '0x0',
        url: 'test'
    }
}