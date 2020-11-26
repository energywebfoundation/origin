import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class InviteDTO {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    email: string;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    role: number;
}
