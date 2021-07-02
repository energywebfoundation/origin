import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { CertificationRequestDTO } from '@energyweb/issuer-api';

export class CertificationRequestFieldsIrec {
    @ApiProperty({ type: String, required: true })
    userId: string;

    @ApiProperty({ type: String, required: false })
    irecIssueRequestId?: string;
}

export class IrecCertificationRequestDTO extends CertificationRequestFieldsIrec {
    @ApiProperty({ type: Number })
    certificationRequestId: number;
}

export class FullCertificationRequestDTO extends IntersectionType(
    CertificationRequestDTO,
    CertificationRequestFieldsIrec
) {}
