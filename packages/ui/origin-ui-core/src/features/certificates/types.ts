import { ClaimDTO } from '@energyweb/issuer-api-client';
import { BigNumber } from 'ethers';

export interface IEnergy {
    publicVolume: BigNumber;
    privateVolume: BigNumber;
    claimedVolume: BigNumber;
}

export interface ICertificate {
    id: number;
    deviceId: string;
    generationStartTime: number;
    generationEndTime: number;
    creationTime: number;
    energy: IEnergy;
    isOwned: boolean;
    isClaimed: boolean;
    myClaims?: ClaimDTO[];

    // Blockchain specific properties
    blockchain?: any;
    tokenId?: number;
    creationBlockHash?: string;
}

export interface ICertificationRequest {
    id: number;
    deviceId: string;
    energy: string;
    owner: string;
    fromTime: number;
    toTime: number;
    files: string[];
    created: number;
    approved: boolean;
    revoked: boolean;
    approvedDate?: string;
    revokedDate?: string;

    // Blockchain specific properties
    requestId?: number;
    issuedCertificateTokenId?: number;
}

export interface ICertificateEnergy {
    publicVolume: BigNumber;
    privateVolume: BigNumber;
    claimedVolume: BigNumber;
}

export enum CertificateSource {
    Blockchain,
    Exchange
}

export interface ICertificateViewItem extends ICertificate {
    energy: ICertificateEnergy;
    isClaimed: boolean;
    isOwned: boolean;
    source: CertificateSource;
    assetId?: string;
}
