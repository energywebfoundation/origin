import { UserPasswordUpdate } from '@energyweb/origin-backend-core';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordDTO implements UserPasswordUpdate {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    oldPassword: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    newPassword: string;
}
