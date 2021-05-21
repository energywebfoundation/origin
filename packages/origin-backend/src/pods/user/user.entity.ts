import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { Exclude } from 'class-transformer';

import { IUser, KYCStatus, UserStatus } from '@energyweb/origin-backend-core';

import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { IsEnum } from 'class-validator';
import { Organization } from '../organization/organization.entity';

@Entity()
export class User extends ExtendedBaseEntity implements IUser {
    constructor(user: Partial<User>) {
        super();

        Object.assign(this, user);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column()
    telephone: string;

    @Column({ nullable: true, select: false })
    @Exclude()
    password: string;

    @Column({ nullable: true })
    notifications: boolean;

    @ManyToOne(() => Organization, (organization) => organization.users)
    organization: Organization;

    @Column({ default: 0, nullable: false })
    rights: number;

    @Column({ default: UserStatus.Pending, nullable: false })
    @IsEnum(UserStatus)
    status: UserStatus;

    @Column({ default: KYCStatus.Pending, nullable: false })
    @IsEnum(KYCStatus)
    kycStatus: KYCStatus;
}
