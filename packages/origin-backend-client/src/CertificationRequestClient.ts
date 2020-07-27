/* eslint-disable max-classes-per-file */
import { BigNumber } from 'ethers';
import {
    ICertificationRequest,
    CertificationRequestUpdateData,
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

export interface ICertificationRequestClient {
    queueCertificationRequestData(data: CertificationRequestUpdateData): Promise<boolean>;
    validateGenerationPeriod(data: CertificationRequestValidationData): Promise<ISuccessResponse>;
    getCertificationRequest(id: ICertificationRequest['id']): Promise<ICertificationRequest>;
    getAllCertificationRequests(): Promise<ICertificationRequest[]>;
}

export class CertificationRequestClient implements ICertificationRequestClient {
    constructor(
        private readonly dataApiUrl: string,
        private readonly requestClient: IRequestClient = new RequestClient()
    ) {}

    private get certificateRequestEndpoint() {
        return `${this.dataApiUrl}/CertificationRequest`;
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
            energy: BigNumber.from(data.energy),
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
                energy: BigNumber.from(certReq.energy),
                deviceId: certReq.device.id.toString(),
                approvedDate: certReq.approvedDate ? new Date(certReq.approvedDate) : null,
                revokedDate: certReq.revokedDate ? new Date(certReq.revokedDate) : null
            };
        });
    }
}
