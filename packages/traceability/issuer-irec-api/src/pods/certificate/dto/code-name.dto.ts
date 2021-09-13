import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CodeNameDTO {
    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    @Expose()
    name: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    @Expose()
    code: string;
}
