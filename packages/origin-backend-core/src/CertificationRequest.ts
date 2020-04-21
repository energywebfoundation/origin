import { BigNumber, bigNumberify } from 'ethers/utils';

// Maximum number Solidity can handle is (2^256)-1
export const MAX_ENERGY_PER_CERTIFICATE = bigNumberify(2).pow(256).sub(1);

export interface ICertificationRequest {
    id: number;
    fromTime: number;
    toTime: number;
    files: string[];
    created: number;
    approved: boolean;
    revoked: boolean;
    energy: BigNumber;
    deviceId: string;
}

export type CertificationRequestOffChainData = Pick<
    ICertificationRequest,
    'id' | 'energy' | 'files'
>;
export type CertificationRequestUpdateData = Pick<
    CertificationRequestOffChainData,
    'energy' | 'files'
>;
