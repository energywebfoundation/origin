import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class RevokeCertificationRequestDTO {
    @ApiProperty({ type: Number, description: 'Certificate Request Id' })
    @IsInt()
    @Min(0)
    id: number;
}
