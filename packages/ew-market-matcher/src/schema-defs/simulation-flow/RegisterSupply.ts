import * as EwMarket from 'ew-market-lib';
import { IdentifiableEntity } from '.';

export interface SupplyData extends IdentifiableEntity {
    offChainProperties: EwMarket.Supply.SupplyOffchainProperties;
    onChainProperties: EwMarket.Supply.SupplyOnChainProperties;
}

export interface RegisterSupplyAction {
    type: RegisterSupplyActionType;
    data: SupplyData;
}

export enum RegisterSupplyActionType {
    RegisterSupply = 'REGISTER_SUPPLY',
}

export const supplyDataToEntity = (supplyData: SupplyData): EwMarket.Supply.Entity => {
    const supply = new EwMarket.Supply.Entity(supplyData.id, null);
    supply.offChainProperties = supplyData.offChainProperties;   
    Object.keys(supplyData.onChainProperties)
        .forEach((key: string) => supply[key] = supplyData.onChainProperties[key]);
    return supply;

};