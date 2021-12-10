import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

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
    @Matches(/((?=.*[0-9])(?=.*[A-Za-z]).{6,})/, {
        message:
            'Password must contain minimum 6 characters (upper and/or lower case) and at least 1 digit'
    })
    @IsNotEmpty()
    @IsString()
    password: string;
}
