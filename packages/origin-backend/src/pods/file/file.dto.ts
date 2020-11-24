import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FileDto {
    @ApiProperty({ type: 'blob', format: 'binary' })
    @IsNotEmpty()
    data: Buffer;
}
