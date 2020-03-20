import { IsInt, IsPositive, IsUUID, Validate } from 'class-validator';

import { PositiveBNStringValidator } from '../../utils/positiveBNStringValidator';

export class DirectBuyDTO {
    @IsUUID()
    readonly askId: string;

    @Validate(PositiveBNStringValidator)
    readonly volume: string;

    @IsInt()
    @IsPositive()
    readonly price: number;
}
