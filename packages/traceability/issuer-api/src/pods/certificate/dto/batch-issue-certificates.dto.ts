import { OmitType } from '@nestjs/swagger';
import { IssueCertificateDTO } from './issue-certificate.dto';

export class BatchIssueCertificateDTO extends OmitType(IssueCertificateDTO, [
    'isPrivate'
] as const) {}
