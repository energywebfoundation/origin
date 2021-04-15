import { UserRegistrationData } from '@energyweb/origin-backend-core';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { UserDTO } from './user.dto';

export class RegisterUserDTO
    extends PickType(UserDTO, [
        'title',
        'firstName',
        'lastName',
        'email',
        'telephone'
        //'blockchainAccountAddress' // really want to just use it here but can't convert optional prop to required
    ] as const)
    implements UserRegistrationData {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    password: string;

    // don't like this. the base type really should change everywhere to have blockchainAccountAddress as not optional now (but this isn't backwards compatible)
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    blockchainAccountAddress: string;
}
