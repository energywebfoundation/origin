import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { IssueCertificateDTO } from './issue-certificate.dto';

export class BatchIssueCertificateDTO extends OmitType(IssueCertificateDTO, [
    'isPrivate'
] as const) {}

export class BatchIssueCertificatesDTO {
    @ApiProperty({ type: [BatchIssueCertificateDTO] })
    @ValidateNested()
    certificatesInfo: BatchIssueCertificateDTO[];
}
