import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CertificateIdsDTO {
    @ApiProperty({ type: [Number] })
    @IsInt({ each: true })
    @Min(1, { each: true })
    ids: number[];
}
