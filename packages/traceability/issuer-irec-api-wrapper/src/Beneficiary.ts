import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class BeneficiaryCreateParams {
    @IsString()
    name: string;

    @Expose({ name: 'country_code', toPlainOnly: true })
    @IsString()
    countryCode: string;

    @IsString()
    location: string;

    @IsOptional()
    @IsBoolean()
    active: boolean;
}

export class BeneficiaryUpdateParams {
    @IsBoolean()
    active: boolean;
}

export class Beneficiary extends BeneficiaryCreateParams {
    @IsInt()
    id: number;
}
