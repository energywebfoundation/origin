import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsEmail,
    IsISO31661Alpha2,
    IsNotEmpty,
    IsOptional,
    IsString
} from 'class-validator';

export class NewOrganizationDTO {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    public name: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    public address: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    public zipCode: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    public city: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsISO31661Alpha2()
    public country: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    public businessType: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    public tradeRegistryCompanyNumber: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    public vatNumber: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    public signatoryFullName: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    public signatoryAddress: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    public signatoryZipCode: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    public signatoryCity: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsISO31661Alpha2()
    public signatoryCountry: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsEmail()
    public signatoryEmail: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    public signatoryPhoneNumber: string;

    @ApiProperty({ type: [String], required: false })
    @IsOptional()
    @IsArray()
    public documentIds?: string[];

    @ApiProperty({ type: [String], required: false })
    @IsOptional()
    @IsArray()
    public signatoryDocumentIds?: string[];
}
