import { Validate, IsUUID, IsInt, IsPositive } from 'class-validator';
import { BNStringValidator } from '../../utils/bnStringValidator';

export class DirectBuyDTO {
    @IsUUID()
    readonly askId: string;

    @Validate(BNStringValidator)
    readonly volume: string;

    @IsInt()
    @IsPositive()
    readonly price: number;
}
