import { UserLoginReturnData } from '@energyweb/origin-backend-core';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginReturnDataDTO implements UserLoginReturnData {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    accessToken: string;
}
