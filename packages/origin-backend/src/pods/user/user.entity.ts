import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { Exclude } from 'class-transformer';

import { IUser, KYCStatus, UserStatus } from '@energyweb/origin-backend-core';
import { ApiProperty } from '@nestjs/swagger';

import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { IsEnum } from 'class-validator';
import { Organization } from '../organization/organization.entity';

@Entity()
export class User extends ExtendedBaseEntity implements IUser {
    constructor(user: Partial<User>) {
        super();

        Object.assign(this, user);
    }

    @ApiProperty({ type: Number })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ type: String })
    @Column()
    title: string;

    @ApiProperty({ type: String })
    @Column()
    firstName: string;

    @ApiProperty({ type: String })
    @Column()
    lastName: string;

    @ApiProperty({ type: String })
    @Column({ unique: true })
    email: string;

    @ApiProperty({ type: String })
    @Column()
    telephone: string;

    @ApiProperty({ type: String })
    @Column({ select: false })
    @Exclude()
    password: string;

    @Column({ nullable: true })
    notifications: boolean;

    @ApiProperty({ type: Organization })
    @ManyToOne(() => Organization, (organization) => organization.users)
    organization: Organization;

    @ApiProperty({ type: Number })
    @Column({ default: 0, nullable: false })
    rights: number;

    @ApiProperty({ enum: UserStatus, enumName: 'UserStatus' })
    @Column({ default: UserStatus.Pending, nullable: false })
    @IsEnum(UserStatus)
    status: UserStatus;

    @ApiProperty({ enum: KYCStatus, enumName: 'KYCStatus' })
    @Column({ default: KYCStatus.Pending, nullable: false })
    @IsEnum(KYCStatus)
    kycStatus: KYCStatus;
}
