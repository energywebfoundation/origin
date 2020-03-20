import { IsDateString, IsInt, IsPositive, Validate, ValidateNested } from 'class-validator';

import { PositiveBNStringValidator } from '../../utils/positiveBNStringValidator';
import { ProductDTO } from './product.dto';

export class CreateBidDTO {
    @Validate(PositiveBNStringValidator)
    readonly volume: string;

    @IsInt()
    @IsPositive()
    readonly price: number;

    @IsDateString()
    readonly validFrom: string;

    @ValidateNested()
    readonly product: ProductDTO;
}
