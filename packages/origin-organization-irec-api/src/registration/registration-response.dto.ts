import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterResponseDTO {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    id: string;
}
