import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, Unique, ManyToOne } from 'typeorm';
import { Length, IsNotEmpty } from 'class-validator';

import { IUser } from '@energyweb/origin-backend-core';

import { Organization } from '../organization/organization.entity';

@Entity()
@Unique(['email', 'blockchainAccountAddress'])
export class User extends BaseEntity implements IUser {
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

    @Column()
    @Length(4, 100)
    password: string;

    @Column()
    blockchainAccountAddress: string;

    @Column()
    blockchainAccountSignedMessage: string;

    @ManyToOne(
        () => Organization,
        organization => organization.users
    )
    organization: Organization;
}
