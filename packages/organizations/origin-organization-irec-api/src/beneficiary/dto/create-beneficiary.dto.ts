import { ApiProperty } from '@nestjs/swagger';
import { IsISO31661Alpha2, IsNotEmpty, IsString } from 'class-validator';

export class CreateBeneficiaryDto {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsISO31661Alpha2()
    countryCode: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    location: string;
}
