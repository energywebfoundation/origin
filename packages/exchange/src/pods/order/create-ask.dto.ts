import { IsInt, IsUUID, IsPositive, Validate, IsNotEmpty, IsDateString } from 'class-validator';
import { BNStringValidator } from '../../utils/bnStringValidator';

export class CreateAskDTO {
    @Validate(BNStringValidator)
    readonly volume: string;

    @IsInt()
    @IsPositive()
    readonly price: number;

    @IsDateString()
    readonly validFrom: string;

    @IsNotEmpty()
    readonly userId: string;

    @IsUUID()
    readonly assetId: string;
}
