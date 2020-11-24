import { IPublicOrganization, IUser, KYCStatus, UserStatus } from '@energyweb/origin-backend-core';
import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested
} from 'class-validator';
import { PublicOrganizationInfoDTO } from '../organization';

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
    @IsNotEmpty()
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

    @ApiProperty({ type: PublicOrganizationInfoDTO })
    @ValidateNested()
    organization: IPublicOrganization;

    @ApiProperty({ type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    emailConfirmed?: boolean;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    blockchainAccountAddress?: string;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    blockchainAccountSignedMessage?: string;
}
