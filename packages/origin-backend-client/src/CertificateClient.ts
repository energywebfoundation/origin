import { bigNumberify } from 'ethers/utils';
import {
    ICertificationRequest,
    CertificationRequestUpdateData,
    CommitmentStatus,
    IOwnershipCommitmentProofWithTx,
    ICertificationRequestBackend
} from '@energyweb/origin-backend-core';

import { IRequestClient, RequestClient } from './RequestClient';

export class CertificationRequestUpdateDTO {
    energy: string;
    files: string[];
}

export interface ICertificateClient {
    updateCertificationRequest(
        id: number,
        data: CertificationRequestUpdateData
    ): Promise<boolean>;
    getCertificationRequest(id: number): Promise<ICertificationRequest>;
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

    public async updateCertificationRequest(
        id: number,
        data: CertificationRequestUpdateData
    ): Promise<boolean> {
        const dto: CertificationRequestUpdateDTO = {
            energy: data.energy.toString(),
            files: data.files
        };

        const response = await this.requestClient.post<CertificationRequestUpdateDTO, boolean>(
            `${this.certificateRequestEndpoint}/${id}`,
            dto
        );

        const success = response.status >= 200 && response.status < 300;

        if (!success) {
            console.error(`Unable to create certification request ${id}`);
            console.error(JSON.stringify(response));
        }

        return success;
    }

    public async getCertificationRequest(
        id: number
    ): Promise<ICertificationRequest> {
        const { data } = await this.requestClient.get<void, ICertificationRequestBackend>(
            `${this.certificateRequestEndpoint}/${id}`
        );

        return {
            id,
            ...data,
            energy: bigNumberify(data.energy),
            deviceId: data.device.id.toString()
        };
    }

    public async getAllCertificationRequests(): Promise<ICertificationRequest[]> {
        const { data } = await this.requestClient.get<void, ICertificationRequestBackend[]>(this.certificateRequestEndpoint);

        return data.map(certReq => {
            return {
                ...certReq,
                energy: bigNumberify(certReq.energy),
                deviceId: certReq.device.id.toString()
            };
        });
    }

    public async getOwnershipCommitment(
        certificateId: number
    ): Promise<IOwnershipCommitmentProofWithTx> {
        const url = `${this.certificateEndpoint}/${certificateId}/OwnershipCommitment`;
        const { data } = await this.requestClient.get(url);

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
