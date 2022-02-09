import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';

export type IClaimData = {
    beneficiary: string;
    location: string;
    countryCode: string;
    periodStartDate: string;
    periodEndDate: string;
    purpose: string;
};

export class ClaimDataDTO implements IClaimData {
    @ApiProperty({ type: String, example: 'Beneficiary One' })
    @IsString()
    beneficiary: string;

    @ApiProperty({ type: String, example: '133 N. St, Orange County, CA 19444' })
    @IsString()
    location: string;

    @ApiProperty({ type: String, example: 'US' })
    @IsString()
    countryCode: string;

    @ApiProperty({ type: String, example: '2021-11-08T17:11:11.883Z', description: 'ISO String' })
    @IsDateString()
    periodStartDate: string;

    @ApiProperty({ type: String, example: '2021-11-08T17:11:11.883Z', description: 'ISO String' })
    @IsDateString()
    periodEndDate: string;

    @ApiProperty({ type: String, example: 'claiming' })
    @IsString()
    purpose: string;
}
