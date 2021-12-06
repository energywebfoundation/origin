import { IsInt, IsNotEmpty, IsPositive, IsUUID, Validate } from 'class-validator';

import { IntUnitsOfEnergy, PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';

export class DirectBuyDTO {
    @ApiProperty({
        type: String,
        description: 'UUID string identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsNotEmpty()
    @IsUUID()
    readonly askId: string;

    @ApiProperty({ type: String, example: '500' })
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
