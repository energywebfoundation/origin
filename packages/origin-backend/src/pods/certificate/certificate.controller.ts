import {
    CertificationRequestCreateData,
    CertificationRequestStatus,
    ICertificationRequestWithRelationsIds,
    CertificationRequestUpdateData
} from '@energyweb/origin-backend-core';

import {
    Controller,
    Post,
    Body,
    Get,
    Put,
    Param,
    BadRequestException,
    UnprocessableEntityException
} from '@nestjs/common';
import { validate } from 'class-validator';
import { CertificationRequestService } from './certification-request.service';

const CERTIFICATION_REQUEST_ENDPOINT = '/CertificationRequest';

@Controller('/Certificate')
export class CertificateController {
    constructor(private readonly certificationRequestService: CertificationRequestService) {}

    @Post(CERTIFICATION_REQUEST_ENDPOINT)
    async createCertificationRequest(
        @Body() data: CertificationRequestCreateData
    ): Promise<ICertificationRequestWithRelationsIds> {
        if (typeof data.device === 'undefined') {
            throw new UnprocessableEntityException({
                errors: [`Missing data.device`]
            });
        }

        const { device, ...entityProperties } = data;

        const entity = await this.certificationRequestService.create(
            {
                ...entityProperties,
                status: CertificationRequestStatus.Pending
            },
            device.toString()
        );

        const validationErrors = await validate(entity);

        if (validationErrors.length > 0) {
            throw new UnprocessableEntityException({
                errors: validationErrors
            });
        }

        await entity.save();

        return this.certificationRequestService.findOneCertificationRequest(entity.id);
    }

    @Get(CERTIFICATION_REQUEST_ENDPOINT)
    async getCertificationRequests(): Promise<ICertificationRequestWithRelationsIds[]> {
        return this.certificationRequestService.findCertificationRequest();
    }

    @Put(`${CERTIFICATION_REQUEST_ENDPOINT}/:id`)
    async updateCertificationRequest(
        @Body() data: CertificationRequestUpdateData,
        @Param('id') id: string
    ): Promise<ICertificationRequestWithRelationsIds> {
        try {
            return this.certificationRequestService.approveCertificationRequest(id);
        } catch (error) {
            throw new BadRequestException(error?.message ?? 'Unknown error');
        }
    }

    @Get(`${CERTIFICATION_REQUEST_ENDPOINT}/:id`)
    async getCertificationRequest(
        @Param('id') id: string
    ): Promise<ICertificationRequestWithRelationsIds> {
        return this.certificationRequestService.findOneCertificationRequest(id);
    }
}
