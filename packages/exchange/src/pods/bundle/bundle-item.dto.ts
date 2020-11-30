import { IsNotEmpty, IsUUID, Validate } from 'class-validator';
import { IntUnitsOfEnergy, PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';

export class BundleItemDTO {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsUUID()
    assetId: string;

    @ApiProperty({ type: String })
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    volume: string;
}
