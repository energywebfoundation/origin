import { ApiProperty } from '@nestjs/swagger';
import { IClaimData } from '@energyweb/issuer';
import { IsDateString, IsString } from 'class-validator';
//TO DO
export class ClaimDataDTO implements IClaimData {
    @ApiProperty({ type: String, example: "Beneficiary One" })
    @IsString()
    beneficiary: string;

    @ApiProperty({ type: String, example: "133 N. St, Orange County, CA 19444"})
    @IsString()
    location: string;

    @ApiProperty({ type: String, example: "US"})
    @IsString()
    countryCode: string;

    @ApiProperty({ type: String, example: "	2021-11-06", description: "ISO String"})
    @IsDateString()
    periodStartDate: string;

    @ApiProperty({ type: String, example: "	2021-11-06", description: "ISO String" })
    @IsDateString()
    periodEndDate: string;

    @ApiProperty({ type: String, example: "claiming" })
    @IsString()
    purpose: string;
}
