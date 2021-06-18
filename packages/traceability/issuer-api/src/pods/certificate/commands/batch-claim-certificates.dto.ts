import { IntUnitsOfEnergy } from '@energyweb/origin-backend-utils';
import { IClaimData } from '@energyweb/issuer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsObject, Validate } from 'class-validator';

export class BatchClaimCertificatesDTO {
    @ApiProperty({ type: [Number] })
    @IsArray()
    certificateIds: number[];

    @ApiProperty({ type: Object })
    @IsObject()
    claimData: IClaimData;

    @ApiPropertyOptional({ type: [String] })
    @Validate(IntUnitsOfEnergy, { each: true })
    values?: string[];
}
