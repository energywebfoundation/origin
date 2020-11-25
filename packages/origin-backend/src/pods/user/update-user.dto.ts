import { UserUpdateData } from '@energyweb/origin-backend-core';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserDTO implements UserUpdateData {
    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    blockchainAccountSignedMessage?: string;

    @ApiProperty({ type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    notifications: boolean;
}
