/* eslint-disable max-classes-per-file */
import { bigNumberify } from 'ethers/utils';
import {
    ICertificationRequest,
    CertificationRequestUpdateData,
    CommitmentStatus,
    IOwnershipCommitmentProofWithTx,
    ICertificationRequestBackend,
    CertificationRequestValidationData,
    ISuccessResponse
} from '@energyweb/origin-backend-core';

import { IRequestClient, RequestClient } from './RequestClient';

export class CertificationRequestUpdateDTO {
    deviceId: string;

    fromTime: number;

    toTime: number;

    energy: string;

    files: string[];
}

export interface ICertificateClient {
    queueCertificationRequestData(data: CertificationRequestUpdateData): Promise<boolean>;
    validateGenerationPeriod(data: CertificationRequestValidationData): Promise<ISuccessResponse>;
    getCertificationRequest(id: ICertificationRequest['id']): Promise<ICertificationRequest>;
    getAllCertificationRequests(): Promise<ICertificationRequest[]>;
    getOwnershipCommitment(certificateId: number): Promise<IOwnershipCommitmentProofWithTx>;
    addOwnershipCommitment(
        certificateId: number,
        data: IOwnershipCommitmentProofWithTx
    ): Promise<CommitmentStatus>;
}

export class CertificateClient implements ICertificateClient {
    constructor(
        private readonly dataApiUrl: string,
        private readonly requestClient: IRequestClient = new RequestClient()
    ) {}

    private get certificateEndpoint() {
        return `${this.dataApiUrl}/Certificate`;
    }

    private get certificateRequestEndpoint() {
        return `${this.certificateEndpoint}/CertificationRequest`;
    }

    public async queueCertificationRequestData(
        data: CertificationRequestUpdateData
    ): Promise<boolean> {
        const dto: CertificationRequestUpdateDTO = {
            ...data,
            energy: data.energy.toString()
        };

        const response = await this.requestClient.post<CertificationRequestUpdateDTO, boolean>(
            `${this.certificateRequestEndpoint}`,
            dto
        );

        const success = response.status >= 200 && response.status < 300;

        if (!success) {
            console.error(
                `Unable to queue certification request for device ${data.deviceId}:${data.fromTime}-${data.toTime}`
            );
            console.error(JSON.stringify(response));
        }

        return success;
    }

    public async validateGenerationPeriod(
        data: CertificationRequestValidationData
    ): Promise<ISuccessResponse> {
        const response = await this.requestClient.get<
            CertificationRequestValidationData,
            ISuccessResponse
        >(`${this.certificateRequestEndpoint}/validate`, { params: data });

        return response.data;
    }

    public async getCertificationRequest(id: number): Promise<ICertificationRequest> {
        const { data } = await this.requestClient.get<void, ICertificationRequestBackend>(
            `${this.certificateRequestEndpoint}/${id}`
        );

        return {
            id,
            ...data,
            energy: bigNumberify(data.energy),
            deviceId: data.device.id.toString(),
            approvedDate: data.approvedDate ? new Date(data.approvedDate) : null,
            revokedDate: data.revokedDate ? new Date(data.revokedDate) : null
        };
    }

    public async getAllCertificationRequests(): Promise<ICertificationRequest[]> {
        const { data } = await this.requestClient.get<void, ICertificationRequestBackend[]>(
            this.certificateRequestEndpoint
        );

        return data.map((certReq) => {
            return {
                ...certReq,
                energy: bigNumberify(certReq.energy),
                deviceId: certReq.device.id.toString(),
                approvedDate: certReq.approvedDate ? new Date(certReq.approvedDate) : null,
                revokedDate: certReq.revokedDate ? new Date(certReq.revokedDate) : null
            };
        });
    }

    public async getOwnershipCommitment(
        certificateId: number
    ): Promise<IOwnershipCommitmentProofWithTx> {
        const url = `${this.certificateEndpoint}/${certificateId}/OwnershipCommitment`;
        const { data } = await this.requestClient.get<unknown, IOwnershipCommitmentProofWithTx>(
            url
        );

        return data;
    }

    public async addOwnershipCommitment(
        certificateId: number,
        proof: IOwnershipCommitmentProofWithTx
    ): Promise<CommitmentStatus> {
        const request = await this.requestClient.put<
            IOwnershipCommitmentProofWithTx,
            CommitmentStatus
        >(`${this.certificateEndpoint}/${certificateId}/OwnershipCommitment`, proof);

        return request.data;
    }
}
