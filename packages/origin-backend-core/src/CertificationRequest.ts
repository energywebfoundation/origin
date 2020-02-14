import { IDeviceWithId } from './Device';

export enum CertificationRequestStatus {
    Pending,
    Rejected,
    Approved
}

export interface ICertificationRequestProperties {
    id: string;
    energy: number;
    startTime: number;
    endTime: number;
    files: string[];
    createdDate: Date;
    status: CertificationRequestStatus;
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

export type CertificationRequestCreateData = Omit<
    ICertificationRequestWithRelationsIds,
    'id' | 'status' | 'createdDate'
>;

export type CertificationRequestUpdateData = Pick<ICertificationRequestWithRelationsIds, 'status'>;
