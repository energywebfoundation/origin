import { UserRegistrationData } from '@energyweb/origin-backend-core';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterUserDTO implements UserRegistrationData {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    lastName: string;

    @ApiProperty({ type: String })
    @IsEmail()
    @Transform((value: string) => value.toLowerCase())
    email: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    telephone: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    password: string;
}
