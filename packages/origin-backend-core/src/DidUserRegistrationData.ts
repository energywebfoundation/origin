import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { Role } from './User';

export class DidUserRegistrationData {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsEmail()
    @Transform((value: string) => value.toLowerCase())
    email: string;

    @IsNotEmpty()
    @IsString()
    did: string;

    @IsNotEmpty()
    @IsString()
    telephone: string;

    role: Role;
}
