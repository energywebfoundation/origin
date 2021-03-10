import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ClaimDataDTO {
    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    beneficiary?: string;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    region?: string;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    zipCode?: string;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
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
