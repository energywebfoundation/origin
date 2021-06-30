import { IClaimData } from '@energyweb/issuer';
import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested, IsObject } from 'class-validator';
import { CertificateAmountDTO } from '../dto/certificate-amount.dto';

export class BatchClaimCertificatesDTO {
    @ApiProperty({ type: [CertificateAmountDTO] })
    @ValidateNested({ each: true })
    certificateAmounts: CertificateAmountDTO[];

    @ApiProperty({ type: Object })
    @IsObject()
    claimData: IClaimData;
}
