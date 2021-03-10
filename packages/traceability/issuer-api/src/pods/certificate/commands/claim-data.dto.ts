import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class ClaimDataDTO {
    @ApiProperty({ type: String, required: false })
    @IsOptional()
    beneficiary?: string;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    address?: string;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    region?: string;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    zipCode?: string;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    countryCode?: string;

    @ApiProperty({ type: Date, required: false })
    @IsOptional()
    @IsDateString()
    fromDate?: string;

    @ApiProperty({ type: Date, required: false })
    @IsOptional()
    @IsDateString()
    toDate?: string;
}
