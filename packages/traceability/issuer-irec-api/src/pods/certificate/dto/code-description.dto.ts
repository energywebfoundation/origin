import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CodeDescriptionDTO {
    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    @Expose()
    code: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    @Expose()
    description: string;
}
