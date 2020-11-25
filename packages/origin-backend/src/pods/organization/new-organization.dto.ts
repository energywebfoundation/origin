import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    public country: number;

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

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    public signatoryCountry: number;

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
