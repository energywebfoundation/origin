import { IsNotEmpty, IsUUID, Validate } from 'class-validator';
import { PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';

export class BuyBundleDTO {
    @ApiProperty({
        type: String,
        description: 'UUID string identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsNotEmpty()
    @IsUUID()
    readonly bundleId: string;

    @ApiProperty({ type: String, example: '500' })
    @IsNotEmpty()
    @Validate(PositiveBNStringValidator)
    readonly volume: string;
}
