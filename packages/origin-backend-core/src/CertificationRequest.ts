import { IDeviceWithId } from './Device';

export interface ICertificationRequestProperties {
    id: string;
    fromTime: number;
    toTime: number;
    files: string[];
    created: number;
    approved: boolean;
    revoked: boolean;
    energy: number;
}

export interface ICertificationRequest extends ICertificationRequestProperties {
    device: IDeviceWithId | IDeviceWithId['id'];
}

export interface ICertificationRequestWithRelationsIds extends ICertificationRequest {
    device: IDeviceWithId['id'];
}

export interface ICertificationRequestWithRelations extends ICertificationRequest {
    device: IDeviceWithId;
}

export type CertificationRequestOffChainData = Pick<
    ICertificationRequestProperties,
    'id' | 'energy' | 'files'
>;
export type CertificationRequestUpdateData = Pick<
    CertificationRequestOffChainData,
    'energy' | 'files'
>;
