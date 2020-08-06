// eslint-disable-next-line max-classes-per-file
import { DeviceVintage, Operator, Product } from '@energyweb/exchange-core';
import { IsDateString, IsOptional, Min, Validate, ValidateNested, IsEnum } from 'class-validator';

import { Type } from 'class-transformer';
import { DeviceTypeValidator } from '../../utils/deviceTypeValidator';
import { GridOperatorValidator } from '../../utils/gridOperatorValidator';

export class DeviceVintageDTO {
    @Min(1900)
    public year: number;

    @IsOptional()
    @IsEnum(Operator)
    public operator?: Operator;
}

export class ProductDTO {
    @IsOptional()
    @Validate(DeviceTypeValidator)
    public deviceType?: string[];

    @IsOptional()
    public location?: string[];

    @ValidateNested()
    @Type(() => DeviceVintageDTO)
    @IsOptional()
    public deviceVintage?: DeviceVintageDTO;

    @IsDateString()
    @IsOptional()
    public generationFrom?: string;

    @IsDateString()
    @IsOptional()
    public generationTo?: string;

    @IsOptional()
    @Validate(GridOperatorValidator)
    public gridOperator?: string[];

    public static toProduct(dto: ProductDTO): Product {
        return {
            ...dto,
            deviceVintage: dto.deviceVintage
                ? new DeviceVintage(dto.deviceVintage.year, dto.deviceVintage.operator)
                : null,
            generationTime:
                dto.generationFrom && dto.generationTo
                    ? { from: new Date(dto.generationFrom), to: new Date(dto.generationTo) }
                    : null
        };
    }
}
