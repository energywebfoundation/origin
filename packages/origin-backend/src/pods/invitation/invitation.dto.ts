import {
    IOrganizationInvitation,
    OrganizationInvitationStatus,
    OrganizationRole,
    Role
} from '@energyweb/origin-backend-core';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { PublicOrganizationInfoDTO } from '../organization';

export class InvitationDTO implements IOrganizationInvitation {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    email: string;

    @ApiProperty({ enum: Role, enumName: 'Role' })
    @IsEnum(Role)
    role: OrganizationRole;

    @ApiProperty({ enum: OrganizationInvitationStatus, enumName: 'OrganizationInvitationStatus' })
    @IsEnum(OrganizationInvitationStatus)
    status: OrganizationInvitationStatus;

    @ApiProperty({ type: () => PublicOrganizationInfoDTO })
    @ValidateNested()
    organization: PublicOrganizationInfoDTO;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    sender: string;

    @ApiProperty({ type: Date })
    @IsNotEmpty()
    @IsDate()
    createdAt: Date;
}
