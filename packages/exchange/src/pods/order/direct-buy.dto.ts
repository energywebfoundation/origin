import { IsInt, IsPositive, IsUUID, Validate } from 'class-validator';

import { IntUnitsOfEnergy } from '@energyweb/origin-backend-utils';
import { PositiveBNStringValidator } from '../../utils/positiveBNStringValidator';

export class DirectBuyDTO {
    @IsUUID()
    readonly askId: string;

    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    readonly volume: string;

    @IsInt()
    @IsPositive()
    readonly price: number;
}
