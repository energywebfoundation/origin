import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { IsEmail, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import {
    IOrganizationInvitation,
    OrganizationInvitationStatus,
    OrganizationRole,
    Role
} from '@energyweb/origin-backend-core';

import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { Organization } from '../organization/organization.entity';

@Entity({ name: 'organization_invitation' })
export class Invitation extends ExtendedBaseEntity implements IOrganizationInvitation {
    @ApiProperty({ type: Number })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ type: String })
    @Column()
    @IsEmail()
    email: string;

    @ApiProperty({ enum: Role, enumName: 'Role' })
    @Column({ default: Role.OrganizationUser })
    @IsEnum(Role)
    role: OrganizationRole;

    @ApiProperty({ enum: OrganizationInvitationStatus, enumName: 'OrganizationInvitationStatus' })
    @Column()
    @IsEnum(OrganizationInvitationStatus)
    status: OrganizationInvitationStatus;

    @ApiProperty({ type: String })
    @Column()
    @IsString()
    sender: string;

    @ManyToOne(() => Organization, (organization) => organization.users)
    organization: Organization;
}
