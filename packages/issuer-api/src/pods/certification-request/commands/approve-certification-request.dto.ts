import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ApproveCertificationRequestDTO {
    @ApiProperty({ type: Number })
    @IsInt()
    @Min(0)
    id: number;
}
