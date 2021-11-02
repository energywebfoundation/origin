import { ApiProperty } from '@nestjs/swagger';
import { IClaim } from '@energyweb/issuer';
import { Validate, IsInt, IsPositive, IsString, ValidateNested } from 'class-validator';
import { IntUnitsOfEnergy } from '@energyweb/origin-backend-utils';
import { ClaimDataDTO } from './claim-data.dto';

export class ClaimDTO implements IClaim {
    @ApiProperty({ type: Number })
    @IsInt()
    @IsPositive()
    id: number;

    @ApiProperty({ type: String })
    @IsString()
    from: string;

    @ApiProperty({ type: String })
    @IsString()
    to: string;

    @ApiProperty({ type: String })
    @IsString()
    topic: string;

    @ApiProperty({ type: String })
    @Validate(IntUnitsOfEnergy)
    value: string;

    @ApiProperty({ type: ClaimDataDTO })
    @ValidateNested()
    claimData: ClaimDataDTO;
}
