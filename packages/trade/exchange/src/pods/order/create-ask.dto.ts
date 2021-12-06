import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNotEmpty, IsPositive, IsUUID, Validate } from 'class-validator';
import { IntUnitsOfEnergy, PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAskDTO {
    @ApiProperty({ type: String, example: '100' })
    @IsNotEmpty()
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    readonly volume: string;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    readonly price: number;

    @ApiProperty({ type: Date, example: 'Tue Nov 16 2021 16:09:43 GMT-0500' })
    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    readonly validFrom: Date;

    @ApiProperty({
        type: String,
        description: 'UUID string identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsNotEmpty()
    @IsUUID()
    readonly assetId: string;
}
