import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { IsEmail } from 'class-validator';
import {
    OrganizationInvitationStatus,
    OrganizationRole,
    Role
} from '@energyweb/origin-backend-core';

import { ExtendedBaseEntity } from '../ExtendedBaseEntity';
import { Organization } from '../organization/organization.entity';

@Entity({ name: 'organization_invitation' })
export class Invitation extends ExtendedBaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsEmail()
    email: string;

    @Column({ default: Role.OrganizationUser })
    role: OrganizationRole;

    @Column()
    status: OrganizationInvitationStatus;

    @Column()
    sender: string;

    @ManyToOne(() => Organization, (organization) => organization.users)
    organization: Organization;
}
