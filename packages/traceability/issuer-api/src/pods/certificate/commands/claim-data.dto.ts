import { ApiProperty } from '@nestjs/swagger';
import { IClaimData } from '@energyweb/issuer';
import { IsDateString, IsString } from 'class-validator';

export class ClaimDataDTO implements IClaimData {
    @ApiProperty({ type: String })
    @IsString()
    beneficiary: string;

    @ApiProperty({ type: String })
    @IsString()
    location: string;

    @ApiProperty({ type: String })
    @IsString()
    countryCode: string;

    @ApiProperty({ type: String })
    @IsDateString()
    periodStartDate: string;

    @ApiProperty({ type: String })
    @IsDateString()
    periodEndDate: string;

    @ApiProperty({ type: String })
    @IsString()
    purpose: string;
}
