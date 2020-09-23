import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class NewOrganizationDTO {
    @IsNotEmpty()
    @IsString()
    public name: string;

    @IsNotEmpty()
    @IsString()
    public address: string;

    @IsNotEmpty()
    @IsString()
    public zipCode: string;

    @IsNotEmpty()
    @IsString()
    public city: string;

    @IsNotEmpty()
    @IsNumber()
    public country: number;

    @IsNotEmpty()
    @IsString()
    public businessType: string;

    @IsNotEmpty()
    @IsString()
    public tradeRegistryCompanyNumber: string;

    @IsNotEmpty()
    @IsString()
    public vatNumber: string;

    @IsNotEmpty()
    @IsString()
    public signatoryFullName: string;

    @IsNotEmpty()
    @IsString()
    public signatoryAddress: string;

    @IsNotEmpty()
    @IsString()
    public signatoryZipCode: string;

    @IsNotEmpty()
    @IsString()
    public signatoryCity: string;

    @IsNotEmpty()
    @IsNumber()
    public signatoryCountry: number;

    @IsNotEmpty()
    @IsEmail()
    public signatoryEmail: string;

    @IsNotEmpty()
    @IsString()
    public signatoryPhoneNumber: string;

    @IsOptional()
    public documentIds?: string[];

    @IsOptional()
    public signatoryDocumentIds?: string[];
}
