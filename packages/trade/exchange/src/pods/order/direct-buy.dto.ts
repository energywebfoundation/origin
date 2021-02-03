import { IsInt, IsNotEmpty, IsPositive, IsUUID, Validate } from 'class-validator';

import { IntUnitsOfEnergy, PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';

export class DirectBuyDTO {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsUUID()
    readonly askId: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    readonly volume: string;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    readonly price: number;
}
