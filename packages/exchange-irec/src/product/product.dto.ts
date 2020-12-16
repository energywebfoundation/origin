// eslint-disable-next-line max-classes-per-file
import { IRECProduct, DeviceVintage, Operator } from '@energyweb/exchange-core-irec';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    Min,
    Validate,
    ValidateNested
} from 'class-validator';

import { DeviceTypeValidator } from '../utils/deviceTypeValidator';
import { GridOperatorValidator } from '../utils/gridOperatorValidator';

export class DeviceVintageDTO {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsInt()
    @Min(1900)
    public year: number;

    @ApiProperty({ enum: Operator, enumName: 'Operator', required: false })
    @IsOptional()
    @IsEnum(Operator)
    public operator?: Operator;
}

export class ProductDTO {
    @ApiProperty({ type: [String], required: false })
    @IsOptional()
    @IsArray()
    @Validate(DeviceTypeValidator)
    public deviceType?: string[];

    @ApiProperty({ type: [String], required: false })
    @IsOptional()
    @IsArray()
    public location?: string[];

    @ApiProperty({ type: DeviceVintageDTO, required: false })
    @ValidateNested()
    @Type(() => DeviceVintageDTO)
    @IsOptional()
    public deviceVintage?: DeviceVintageDTO;

    @ApiProperty({ type: String, required: false })
    @IsDateString()
    @IsOptional()
    public generationFrom?: string;

    @ApiProperty({ type: String, required: false })
    @IsDateString()
    @IsOptional()
    public generationTo?: string;

    @ApiProperty({ type: [String], required: false })
    @IsOptional()
    @Validate(GridOperatorValidator)
    public gridOperator?: string[];

    public static toProduct(dto: ProductDTO): IRECProduct {
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
