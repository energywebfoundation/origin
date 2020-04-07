import { BigNumber } from 'ethers/utils';

export const MAX_ENERGY_PER_CERTIFICATE = 1e16;

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
