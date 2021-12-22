import { IsNotEmpty, IsUUID, Validate } from 'class-validator';
import { IntUnitsOfEnergy, PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';

export class BundleItemDTO {
    @ApiProperty({
        type: String,
        description: 'UUID string identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsNotEmpty()
    @IsUUID()
    assetId: string;

    @ApiProperty({ type: String, example: '100000' })
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    volume: string;
}
