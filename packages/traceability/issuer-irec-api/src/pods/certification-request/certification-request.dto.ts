import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { CertificationRequestDTO } from '@energyweb/issuer-api';

export class CertificationRequestIrec {
    @ApiProperty({ type: String, required: true })
    userId: string;

    @ApiProperty({ type: String, required: false })
    irecIssueId: string;
}

export class CertificationRequestIrecDTO extends IntersectionType(
    CertificationRequestDTO,
    CertificationRequestIrec
) {}
