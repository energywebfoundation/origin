import { IntUnitsOfEnergy } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';
import { Validate } from 'class-validator';

export class EnergyDTO {
    @ApiProperty({ type: String, example: '5000' })
    @Validate(IntUnitsOfEnergy)
    publicVolume: string;

    @ApiProperty({ type: String, example: '5000' })
    @Validate(IntUnitsOfEnergy)
    privateVolume: string;

    @ApiProperty({ type: String, example: '5000' })
    @Validate(IntUnitsOfEnergy)
    claimedVolume: string;
}
