import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne } from 'typeorm';
import { Length, IsNotEmpty } from 'class-validator';

import { IUser, IAutoPublishConfig } from '@energyweb/origin-backend-core';

import { Organization } from '../organization/organization.entity';
import { ExtendedBaseEntity } from '../ExtendedBaseEntity';

@Entity()
@Unique(['email', 'blockchainAccountAddress'])
export class User extends ExtendedBaseEntity implements IUser {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    @IsNotEmpty()
    email: string;

    @Column()
    telephone: string;

    @Column({ select: false })
    @Length(4, 100)
    password: string;

    @Column({ nullable: true })
    blockchainAccountAddress: string;

    @Column({ nullable: true })
    blockchainAccountSignedMessage: string;

    @Column({ nullable: true })
    notifications: boolean;

    @Column('simple-json', { nullable: true })
    autoPublish: IAutoPublishConfig;

    @ManyToOne(() => Organization, (organization) => organization.users)
    organization: Organization;

    @Column({ default: 0, nullable: false })
    rights: number;

    @Column({ default: 0, nullable: false })
    status: number;

    @Column({ default: 0, nullable: false })
    kycStatus: number;
}
