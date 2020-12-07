import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { IPublicOrganization, OrganizationStatus } from '@energyweb/origin-backend-core';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { IsString, IsNumber, IsArray, IsEnum } from 'class-validator';
import { Optional } from '@nestjs/common';
import { User } from '../user/user.entity';
import { Device } from '../device/device.entity';
import { Invitation } from '../invitation/invitation.entity';

@Entity({ name: 'platform_organization' })
export class Organization extends ExtendedBaseEntity implements IPublicOrganization {
    constructor(organization?: Partial<Organization>) {
        super();
        Object.assign(this, organization);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsString()
    name: string;

    @Column()
    @IsString()
    address: string;

    @Column()
    @IsString()
    zipCode: string;

    @Column()
    @IsString()
    city: string;

    @Column()
    @IsNumber()
    country: number;

    @Column()
    @IsString()
    businessType: string;

    @Column()
    @IsString()
    tradeRegistryCompanyNumber: string;

    @Column()
    @IsString()
    vatNumber: string;

    @Column()
    @IsString()
    signatoryFullName: string;

    @Column()
    @IsString()
    signatoryAddress: string;

    @Column()
    @IsString()
    signatoryZipCode: string;

    @Column()
    @IsString()
    signatoryCity: string;

    @Column()
    @IsNumber()
    signatoryCountry: number;

    @Column()
    @IsString()
    signatoryEmail: string;

    @Column()
    @IsString()
    signatoryPhoneNumber: string;

    @Column('simple-array', { nullable: true })
    @Optional()
    @IsArray()
    signatoryDocumentIds: string[];

    @Column({ default: OrganizationStatus.Submitted })
    @IsEnum(OrganizationStatus)
    status: OrganizationStatus;

    @OneToMany(() => User, (user) => user.organization, { cascade: true, eager: true })
    users: User[];

    @OneToMany(() => Invitation, (entity) => entity.organization, { eager: true })
    invitations: Invitation[];

    @OneToMany(() => Device, (device) => device.organization, { eager: true })
    devices: Device[];

    @Column('simple-array', { nullable: true })
    @Optional()
    @IsArray()
    documentIds: string[];
}
