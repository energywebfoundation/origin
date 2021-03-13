import { ApiProperty } from '@nestjs/swagger';
import { IClaim } from '@energyweb/issuer';
import { IsInt, IsPositive, IsString, ValidateNested } from 'class-validator';
import { ClaimDataDTO } from './commands/claim-data.dto';

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

    @ApiProperty({ type: Number })
    @IsInt()
    @IsPositive()
    topic: number;

    @ApiProperty({ type: Number })
    @IsInt()
    @IsPositive()
    value: number;

    @ApiProperty({ type: ClaimDataDTO })
    @ValidateNested()
    claimData: ClaimDataDTO;
}
