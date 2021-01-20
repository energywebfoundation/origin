import { UserRegistrationData } from '@energyweb/origin-backend-core';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { UserDTO } from './user.dto';

export class RegisterUserDTO
    extends PickType(UserDTO, ['title', 'firstName', 'lastName', 'email', 'telephone'] as const)
    implements UserRegistrationData {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    password: string;
}
