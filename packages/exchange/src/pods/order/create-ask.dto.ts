import { IsDateString, IsInt, IsPositive, IsUUID, Validate } from 'class-validator';

import { PositiveBNStringValidator } from '../../utils/positiveBNStringValidator';

export class CreateAskDTO {
    @Validate(PositiveBNStringValidator)
    readonly volume: string;

    @IsInt()
    @IsPositive()
    readonly price: number;

    @IsDateString()
    readonly validFrom: string;

    @IsUUID()
    readonly assetId: string;
}
