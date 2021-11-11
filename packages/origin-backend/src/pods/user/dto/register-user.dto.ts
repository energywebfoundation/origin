import { UserRegistrationData } from '@energyweb/origin-backend-core';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { UserDTO } from './user.dto';

export class RegisterUserDTO
    extends PickType(UserDTO, ['title', 'firstName', 'lastName', 'email', 'telephone'] as const)
    implements UserRegistrationData
{
    @ApiProperty({ type: String })
    @Matches(/((?=.*[0-9])(?=.*[A-Za-z]).{6,})/, {
        message:
            'Password must contain minimum 6 characters (upper and/or lower case) and at least 1 digit'
    })
    @IsNotEmpty()
    @IsString()
    password: string;
}
