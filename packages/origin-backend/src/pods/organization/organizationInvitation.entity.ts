import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { IsEmail } from 'class-validator';
import {
    OrganizationInvitationStatus,
    IOrganizationInvitation
} from '@energyweb/origin-backend-core';

import { Organization } from './organization.entity';

@Entity()
export class OrganizationInvitation extends BaseEntity implements IOrganizationInvitation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsEmail()
    email: string;

    @Column()
    status: OrganizationInvitationStatus;

    @ManyToOne(
        () => Organization,
        organization => organization.users
    )
    organization: Organization;
}
