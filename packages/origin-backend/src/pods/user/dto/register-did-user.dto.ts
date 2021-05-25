import { DidUserRegistrationData } from '@energyweb/origin-backend-core';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { UserDTO } from './user.dto';

export class RegisterDidUserDTO
    extends PickType(UserDTO, ['title', 'firstName', 'lastName', 'email', 'telephone'] as const)
    implements DidUserRegistrationData
{
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    did: string;
}
