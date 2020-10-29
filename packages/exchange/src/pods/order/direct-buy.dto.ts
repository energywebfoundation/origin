import { IsInt, IsPositive, IsUUID, Validate } from 'class-validator';

import { IntUnitsOfEnergy, PositiveBNStringValidator } from '@energyweb/origin-backend-utils';

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
