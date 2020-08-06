import { Type } from 'class-transformer';
import { IsDate, IsInt, IsPositive, IsUUID, Validate } from 'class-validator';
import { IntUnitsOfEnergy } from '@energyweb/origin-backend-utils';

import { PositiveBNStringValidator } from '../../utils/positiveBNStringValidator';

export class CreateAskDTO {
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    readonly volume: string;

    @IsInt()
    @IsPositive()
    readonly price: number;

    @IsDate()
    @Type(() => Date)
    readonly validFrom: Date;

    @IsUUID()
    readonly assetId: string;
}
