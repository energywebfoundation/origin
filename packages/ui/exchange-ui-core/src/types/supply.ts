import { SupplyDto, UpdateSupplyDto } from '@energyweb/exchange-client';
import { IDevice } from '@energyweb/origin-backend-core';

export interface IDeviceWithSupply extends IDevice, Partial<Pick<SupplyDto, 'active' | 'price'>> {
    supplyId?: string;
    supplyCreated: boolean;
}

export interface ISupplyTableRecord {
    device: IDeviceWithSupply;
}

export type UpdateSupply = {
    supplyId: string;
    supplyData: UpdateSupplyDto;
};

export type RemoveSupply = {
    supplyId: string;
};
