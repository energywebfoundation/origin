import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { IsEmail } from 'class-validator';
import {
    OrganizationInvitationStatus,
    IOrganizationInvitation,
    OrganizationRole,
    Role
} from '@energyweb/origin-backend-core';

import { Organization } from './organization.entity';
import { ExtendedBaseEntity } from '../ExtendedBaseEntity';

@Entity()
export class OrganizationInvitation extends ExtendedBaseEntity implements IOrganizationInvitation {
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
