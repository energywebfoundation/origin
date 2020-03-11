import {
    CertificationRequestUpdateData,
    CertificationRequestOffChainData
} from '@energyweb/origin-backend-core';

import {
    Controller,
    Post,
    Body,
    Get,
    Param
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CertificationRequest } from './certification-request.entity';
import { Repository } from 'typeorm';

const CERTIFICATION_REQUEST_ENDPOINT = '/CertificationRequest';

@Controller('/Certificate')
export class CertificateController {
    constructor(
        @InjectRepository(CertificationRequest)
        private readonly certificationRequestRepository: Repository<CertificationRequest>
    ) {}

    @Post(`${CERTIFICATION_REQUEST_ENDPOINT}/:id`)
    async updateCertificationRequest(
        @Param('id') id: string,
        @Body() data: CertificationRequestUpdateData
    ): Promise<CertificationRequestOffChainData> {
        const certificationRequest = new CertificationRequest();

        certificationRequest.id = id;
        certificationRequest.energy = data.energy;
        certificationRequest.files = data.files;

        return this.certificationRequestRepository.save(certificationRequest);
    }

    @Get(`${CERTIFICATION_REQUEST_ENDPOINT}/:id`)
    async getCertificationRequest(
        @Param('id') id: string
    ): Promise<CertificationRequestOffChainData> {
        return this.certificationRequestRepository.findOne(id);
    }
}
