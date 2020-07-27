import {
    ICertificationRequest,
    CertificationRequestUpdateData,
    CertificationRequestDataMocked,
    CertificationRequestValidationData,
    ISuccessResponse,
    ICertificationRequestClient
} from '@energyweb/origin-backend-core';

import * as Moment from 'moment';
import { extendMoment } from 'moment-range';

export class CertificationRequestClientMock implements ICertificationRequestClient {
    private requestQueue: CertificationRequestUpdateData[] = [];

    private requestStorage = new Map<number, ICertificationRequest>();

    public async queueCertificationRequestData(
        data: CertificationRequestUpdateData
    ): Promise<boolean> {
        const exists = this.requestQueue.find(
            (queueItem) =>
                queueItem.deviceId === data.deviceId &&
                queueItem.fromTime === data.fromTime &&
                queueItem.toTime === data.toTime
        );

        if (!exists) {
            this.requestQueue.push(data);
        }

        return true;
    }

    public async validateGenerationPeriod(
        data: CertificationRequestValidationData
    ): Promise<ISuccessResponse> {
        const moment = extendMoment(Moment);
        const unix = (timestamp: number) => moment.unix(timestamp);
        const { deviceId, fromTime, toTime } = data;

        const deviceCertificationRequests = (await this.getAllCertificationRequests()).filter(
            (certReq) => certReq.deviceId === deviceId && !certReq.revoked
        );

        const generationTimeRange = moment.range(unix(fromTime), unix(toTime));

        for (const certificationRequest of deviceCertificationRequests) {
            const certificationRequestGenerationRange = moment.range(
                unix(certificationRequest.fromTime),
                unix(certificationRequest.toTime)
            );

            if (generationTimeRange.overlaps(certificationRequestGenerationRange)) {
                throw new Error(
                    `Wanted generation time clashes with an existing certification request: ${certificationRequest.id}`
                );
            }
        }

        return {
            success: true
        };
    }

    public async getCertificationRequest(id: number): Promise<ICertificationRequest> {
        return this.requestStorage.get(id);
    }

    public async getAllCertificationRequests(): Promise<ICertificationRequest[]> {
        return [...this.requestStorage.values()];
    }

    public mockBlockchainData(id: number, reqData: Partial<CertificationRequestDataMocked>) {
        const certificateRequest = this.requestStorage.get(id);

        const queuedData = this.requestQueue.find(
            (data) =>
                data.deviceId === reqData.deviceId &&
                data.fromTime === reqData.fromTime &&
                data.toTime === reqData.toTime
        );

        if (queuedData) {
            const index = this.requestQueue.indexOf(queuedData);
            if (index > -1) {
                this.requestQueue.splice(index, 1);
            }
        }

        this.requestStorage.set(id, {
            id,
            ...certificateRequest,
            ...reqData,
            ...queuedData
        });
    }
}
