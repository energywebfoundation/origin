import { IClaimData } from '@energyweb/issuer';
import { ApiProperty } from '@nestjs/swagger';

export class BulkClaimCertificatesDTO {
    @ApiProperty()
    certificateIds: number[];

    @ApiProperty()
    claimData: IClaimData;
}
