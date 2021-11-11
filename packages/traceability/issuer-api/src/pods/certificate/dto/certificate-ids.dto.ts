import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CertificateIdsDTO {
    @ApiProperty({ type: [Number], description: 'Array of Certificate Ids', example: [1, 2, 3] })
    @IsInt({ each: true })
    @Min(1, { each: true })
    ids: number[];
}
