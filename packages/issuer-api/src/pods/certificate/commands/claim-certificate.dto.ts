import { IClaimData } from '@energyweb/issuer';
import { ApiProperty } from '@nestjs/swagger';

export class ClaimCertificateDTO {
    @ApiProperty()
    claimData: IClaimData;

    @ApiProperty({ required: false })
    amount?: string;
}
