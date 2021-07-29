import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { CertificationRequestDTO } from '@energyweb/issuer-api';

export class CertificationRequestFieldsIrec {
    @ApiProperty({ type: String, required: true })
    organizationId: string;

    @ApiProperty({ type: String, required: false })
    irecIssueRequestId?: string;

    @ApiProperty({ type: String, required: false })
    irecAssetId?: string;
}

export class IrecCertificationRequestDTO extends CertificationRequestFieldsIrec {
    @ApiProperty({ type: Number })
    certificationRequestId: number;
}

export class FullCertificationRequestDTO extends IntersectionType(
    CertificationRequestDTO,
    CertificationRequestFieldsIrec
) {}
