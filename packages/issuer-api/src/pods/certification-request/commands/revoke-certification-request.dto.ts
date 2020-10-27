import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class RevokeCertificationRequestDTO {
    @ApiProperty({ type: Number })
    @IsInt()
    @Min(0)
    id: number;
}
