import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequestPasswordResetDTO {
    @ApiProperty({ type: String, example: 'testuser@mailinator.com' })
    @IsString()
    @IsNotEmpty()
    email: string;
}

export class PasswordResetDTO {
    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    token: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    password: string;
}
