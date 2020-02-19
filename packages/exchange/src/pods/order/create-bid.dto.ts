import {
    IsInt,
    IsNotEmpty,
    IsPositive,
    Validate,
    ValidateNested,
    IsDateString
} from 'class-validator';

import { BNStringValidator } from '../../utils/bnStringValidator';
import { ProductDTO } from './product.dto';

export class CreateBidDTO {
    @Validate(BNStringValidator)
    readonly volume: string;

    @IsInt()
    @IsPositive()
    readonly price: number;

    @IsDateString()
    readonly validFrom: string;

    @ValidateNested()
    readonly product: ProductDTO;

    @IsNotEmpty()
    readonly userId: string;
}
