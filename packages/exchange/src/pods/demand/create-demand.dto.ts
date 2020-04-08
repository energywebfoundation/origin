import { TimeFrame } from '@energyweb/utils-general';
import { Type } from 'class-transformer';
import {
    IsDate,
    Validate,
    ValidateNested,
    IsEnum,
    IsInt,
    IsPositive,
    IsBoolean
} from 'class-validator';

import { PositiveBNStringValidator } from '../../utils/positiveBNStringValidator';
import { ProductDTO } from '../order/product.dto';

export class CreateDemandDTO {
    @IsInt()
    @IsPositive()
    public readonly price: number;

    @Validate(PositiveBNStringValidator)
    public readonly volumePerPeriod: string;

    @IsEnum(TimeFrame)
    public readonly periodTimeFrame: TimeFrame;

    @IsDate()
    @Type(() => Date)
    public readonly start: Date;

    @IsDate()
    @Type(() => Date)
    public readonly end: Date;

    @ValidateNested()
    public readonly product: ProductDTO;

    @IsBoolean()
    public readonly boundToGenerationTime: boolean;
}
