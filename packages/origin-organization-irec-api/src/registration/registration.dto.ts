import { Expose, plainToClass } from 'class-transformer';
import {
    IsEnum,
    IsIn,
    IsInt,
    IsISO31661Alpha2,
    IsNotEmpty,
    IsPositive,
    IsString,
    IsUrl
} from 'class-validator';
import { IRECAccountType } from './account-type.enum';

export class RegistrationDTO {
    @Expose()
    @IsEnum(IRECAccountType)
    accountType: IRECAccountType;

    @Expose()
    @IsISO31661Alpha2()
    headquarterCountry: string;

    @Expose()
    @IsPositive()
    @IsInt()
    registrationYear: number;

    @Expose()
    @IsIn(['1-50', '50-100', '100-300', '300+'])
    employeesNumber: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    shareholders: string;

    @Expose()
    @IsUrl()
    website: string;

    @Expose()
    @IsISO31661Alpha2({ each: true })
    activeCountries: string[];

    public static sanitize(registration: RegistrationDTO): RegistrationDTO {
        return plainToClass(RegistrationDTO, registration, { excludeExtraneousValues: true });
    }
}
