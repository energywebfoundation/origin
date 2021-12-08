import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetOwnershipDTO {
    @ApiProperty({ type: Boolean })
    @IsBoolean()
    selfOwnership: boolean;
}
