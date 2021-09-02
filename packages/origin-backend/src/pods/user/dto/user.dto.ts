import { IUser, KYCStatus, UserStatus } from '@energyweb/origin-backend-core';
import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested
} from 'class-validator';
import { FullOrganizationInfoDTO } from '../../organization';

export class UserDTO implements IUser {
    @ApiProperty({ type: Number })
    @IsNumber()
    id: number;

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
    @IsString()
    email: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    telephone: string;

    @ApiProperty({ type: Boolean })
    @IsNotEmpty()
    @IsBoolean()
    notifications: boolean;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    rights: number;

    @ApiProperty({ enum: UserStatus, enumName: 'UserStatus' })
    @IsEnum(UserStatus)
    status: UserStatus;

    @ApiProperty({ enum: KYCStatus, enumName: 'KYCStatus' })
    @IsEnum(KYCStatus)
    kycStatus: KYCStatus;

    @ApiProperty({ type: FullOrganizationInfoDTO })
    @ValidateNested()
    organization: FullOrganizationInfoDTO;

    @ApiProperty({ type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    emailConfirmed?: boolean;
}
