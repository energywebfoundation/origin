import { BigNumber } from 'ethers';
import { IDevice } from '.';

// Maximum number Solidity can handle is (2^256)-1
export const MAX_ENERGY_PER_CERTIFICATE = BigNumber.from(2).pow(256).sub(1);

export interface ICertificationRequestMinimal {
    id: number;
    owner: string;
    fromTime: number;
    toTime: number;
    files: string[];
    created: number;
    approved: boolean;
    revoked: boolean;
    approvedDate?: Date;
    revokedDate?: Date;
}

export interface ICertificationRequest extends ICertificationRequestMinimal {
    energy: BigNumber;
    deviceId: string;
}

export interface ICertificationRequestBackend extends ICertificationRequestMinimal {
    energy: string;
    device: IDevice;
}

export type CertificationRequestUpdateData = Pick<
    ICertificationRequest,
    'fromTime' | 'toTime' | 'deviceId' | 'energy' | 'files'
>;

export type CertificationRequestValidationData = Pick<
    ICertificationRequest,
    'fromTime' | 'toTime' | 'deviceId'
>;

export type CertificationRequestDataMocked = Pick<
    ICertificationRequest,
    'owner' | 'fromTime' | 'toTime' | 'created' | 'approved' | 'revoked' | 'deviceId'
>;
