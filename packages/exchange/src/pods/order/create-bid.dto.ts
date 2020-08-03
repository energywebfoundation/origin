import { Type } from 'class-transformer';
import { IsDate, IsInt, IsPositive, Validate, ValidateNested } from 'class-validator';
import { IntUnitsOfEnergy } from '@energyweb/origin-backend-utils';

import { PositiveBNStringValidator } from '../../utils/positiveBNStringValidator';
import { ProductDTO } from './product.dto';

export class CreateBidDTO {
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    readonly volume: string;

    @IsInt()
    @IsPositive()
    readonly price: number;

    @IsDate()
    @Type(() => Date)
    readonly validFrom: Date;

    @ValidateNested()
    @Type(() => ProductDTO)
    readonly product: ProductDTO;
}
