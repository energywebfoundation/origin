import { IsNotEmpty, IsUUID, Validate } from 'class-validator';
import { PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';

export class BuyBundleDTO {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsUUID()
    readonly bundleId: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @Validate(PositiveBNStringValidator)
    readonly volume: string;
}
