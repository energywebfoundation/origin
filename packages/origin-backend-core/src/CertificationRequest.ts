import { BigNumber, bigNumberify } from 'ethers/utils';
import { IDevice } from '.';

// Maximum number Solidity can handle is (2^256)-1
export const MAX_ENERGY_PER_CERTIFICATE = bigNumberify(2).pow(256).sub(1);

export interface ICertificationRequestMinimal {
    id: number;
    owner: string;
    fromTime: number;
    toTime: number;
    files: string[];
    created: number;
    approved: boolean;
    revoked: boolean;
}

export interface ICertificationRequest extends ICertificationRequestMinimal {
    energy: BigNumber;
    deviceId: string;
}

export interface ICertificationRequestBackend extends ICertificationRequestMinimal {
    energy: string;
    device: IDevice;
}

export type CertificationRequestUpdateData = Pick<ICertificationRequest, 'energy' | 'files'>;

export type CertificationRequestDataMocked = Pick<
    ICertificationRequest,
    'owner' | 'fromTime' | 'toTime' | 'created' | 'approved' | 'revoked' | 'deviceId'
>;
