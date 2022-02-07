import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Validate, ValidateNested } from 'class-validator';
import { IntUnitsOfEnergy, PositiveBNStringValidator } from '@energyweb/origin-backend-utils';

import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';

export class ClaimIrecDataDTO {
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

export class ClaimIrecCertificateDTO {
    @ApiPropertyOptional({ type: ClaimIrecDataDTO })
    @IsOptional()
    @ValidateNested()
    claimData?: ClaimIrecDataDTO;

    @ApiPropertyOptional({ type: String, example: '1000000' })
    @IsOptional()
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    amount?: string;
}
