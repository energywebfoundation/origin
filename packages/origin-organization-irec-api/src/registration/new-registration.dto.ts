import { Expose, plainToClass } from 'class-transformer';
import {
    IsEnum,
    IsIn,
    IsInt,
    IsISO31661Alpha2,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString,
    IsUrl
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IRECAccountType } from './account-type.enum';

export class NewRegistrationDTO {
    @ApiProperty({ enum: IRECAccountType, enumName: 'IRECAccountType' })
    @Expose()
    @IsEnum(IRECAccountType)
    accountType: IRECAccountType;

    @ApiProperty({ type: String })
    @Expose()
    @IsISO31661Alpha2()
    headquarterCountry: string;

    @ApiProperty({ type: Number })
    @Expose()
    @IsPositive()
    @IsInt()
    registrationYear: number;

    @ApiProperty({ type: String })
    @Expose()
    @IsIn(['1-50', '50-100', '100-300', '300+'])
    employeesNumber: string;

    @ApiProperty({ type: String })
    @Expose()
    @IsString()
    @IsNotEmpty()
    shareholders: string;

    @ApiProperty({ type: String })
    @Expose()
    @IsUrl()
    website: string;

    @ApiProperty({ type: [String] })
    @Expose()
    @IsISO31661Alpha2({ each: true })
    activeCountries: string[];

    @ApiProperty({ type: String })
    @Expose()
    @IsString()
    @IsNotEmpty()
    mainBusiness: string;

    @ApiProperty({ type: String })
    @Expose()
    @IsString()
    @IsNotEmpty()
    ceoName: string;

    @ApiProperty({ type: String })
    @Expose()
    @IsString()
    @IsNotEmpty()
    ceoPassportNumber: string;

    @ApiProperty({ type: String })
    @Expose()
    @IsString()
    @IsNotEmpty()
    balanceSheetTotal: string;

    @ApiProperty({ type: String, required: false })
    @Expose()
    @IsOptional()
    @IsString()
    subsidiaries?: string;

    @ApiProperty({ type: String })
    @Expose()
    @IsString()
    @IsNotEmpty()
    primaryContactOrganizationName: string;

    @ApiProperty({ type: String })
    @Expose()
    @IsString()
    @IsNotEmpty()
    primaryContactOrganizationAddress: string;

    @ApiProperty({ type: String })
    @Expose()
    @IsString()
    @IsNotEmpty()
    primaryContactOrganizationPostalCode: string;

    @ApiProperty({ type: String })
    @Expose()
    @IsNotEmpty()
    @IsISO31661Alpha2()
    primaryContactOrganizationCountry: string;

    @ApiProperty({ type: String })
    @Expose()
    @IsString()
    @IsNotEmpty()
    primaryContactName: string;

    @ApiProperty({ type: String })
    @Expose()
    @IsString()
    @IsNotEmpty()
    primaryContactEmail: string;

    @ApiProperty({ type: String })
    @Expose()
    @IsString()
    @IsNotEmpty()
    primaryContactPhoneNumber: string;

    @ApiProperty({ type: String })
    @Expose()
    @IsString()
    @IsNotEmpty()
    primaryContactFax: string;

    @ApiProperty({ type: String })
    @Expose()
    @IsString()
    @IsNotEmpty()
    leadUserTitle: string;

    @ApiProperty({ type: String })
    @Expose()
    @IsString()
    @IsNotEmpty()
    leadUserFirstName: string;

    @ApiProperty({ type: String })
    @Expose()
    @IsString()
    @IsNotEmpty()
    leadUserLastName: string;

    @ApiProperty({ type: String })
    @Expose()
    @IsString()
    @IsNotEmpty()
    leadUserEmail: string;

    @ApiProperty({ type: String })
    @Expose()
    @IsString()
    @IsNotEmpty()
    leadUserPhoneNumber: string;

    @ApiProperty({ type: String })
    @Expose()
    @IsString()
    @IsNotEmpty()
    leadUserFax: string;

    public static sanitize(registration: NewRegistrationDTO): NewRegistrationDTO {
        return plainToClass(NewRegistrationDTO, registration, { excludeExtraneousValues: true });
    }
}
