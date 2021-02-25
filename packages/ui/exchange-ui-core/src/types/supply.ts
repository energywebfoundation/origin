import { UpdateSupplyDto } from '@energyweb/exchange-client';
import { IExternalDeviceId } from '@energyweb/origin-backend-core';

export interface IDeviceWithSupply {
    facilityName: string;
    deviceType: string;
    toBeCertified: string;
    externalDeviceIds: IExternalDeviceId[];
    price: number;
    active?: boolean;
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
