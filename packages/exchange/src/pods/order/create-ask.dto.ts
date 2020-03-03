import { IsInt, IsUUID, IsPositive, Validate, IsDateString } from 'class-validator';
import { BNStringValidator } from '../../utils/bnStringValidator';

export class CreateAskDTO {
    @Validate(BNStringValidator)
    readonly volume: string;

    @IsInt()
    @IsPositive()
    readonly price: number;

    @IsDateString()
    readonly validFrom: string;

    @IsUUID()
    readonly assetId: string;
}
