import { TimeFrame } from '@energyweb/utils-general';
import { Type } from 'class-transformer';
import {
    IsDate,
    Validate,
    IsEnum,
    IsInt,
    IsPositive,
    IsBoolean,
    IsNotEmpty
} from 'class-validator';
import { IntUnitsOfEnergy, PositiveBNStringValidator } from '@energyweb/origin-backend-utils';

import { ApiProperty } from '@nestjs/swagger';

export class CreateDemandDTO<TProduct> {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    public readonly price: number;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    public readonly volumePerPeriod: string;

    @ApiProperty({ enum: TimeFrame, enumName: 'TimeFrame' })
    @IsNotEmpty()
    @IsEnum(TimeFrame)
    public readonly periodTimeFrame: TimeFrame;

    @ApiProperty({ type: Date })
    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    public readonly start: Date;

    @ApiProperty({ type: Date })
    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    public readonly end: Date;

    @IsNotEmpty()
    public readonly product: TProduct;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    public readonly boundToGenerationTime: boolean;
}
