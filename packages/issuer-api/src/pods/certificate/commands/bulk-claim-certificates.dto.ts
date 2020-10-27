import { IClaimData } from '@energyweb/issuer';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsObject } from 'class-validator';

export class BulkClaimCertificatesDTO {
    @ApiProperty({ type: [Number] })
    @IsArray()
    certificateIds: number[];

    @ApiProperty({ type: Object })
    @IsObject()
    claimData: IClaimData;
}
