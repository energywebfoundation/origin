import { IDevice } from './Device';

export interface ICertificationRequestProperties {
    id: number;
    fromTime: number;
    toTime: number;
    files: string[];
    created: number;
    approved: boolean;
    revoked: boolean;
    energy: number;
}

export interface ICertificationRequest extends ICertificationRequestProperties {
    device: IDevice | IDevice['id'];
}

export interface ICertificationRequestWithRelationsIds extends ICertificationRequest {
    device: IDevice['id'];
}

export interface ICertificationRequestWithRelations extends ICertificationRequest {
    device: IDevice;
}

export type CertificationRequestOffChainData = Pick<
    ICertificationRequestProperties,
    'id' | 'energy' | 'files'
>;
export type CertificationRequestUpdateData = Pick<
    CertificationRequestOffChainData,
    'energy' | 'files'
>;
