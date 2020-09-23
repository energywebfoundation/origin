import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { OrganizationStatus } from '@energyweb/origin-backend-core';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { User } from '../user/user.entity';
import { Device } from '../device/device.entity';
import { Invitation } from '../invitation/invitation.entity';

@Entity({ name: 'platform_organization' })
export class Organization extends ExtendedBaseEntity {
    constructor(organization?: Partial<Organization>) {
        super();
        Object.assign(this, organization);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    address: string;

    @Column()
    zipCode: string;

    @Column()
    city: string;

    @Column()
    country: number;

    @Column()
    businessType: string;

    @Column()
    tradeRegistryCompanyNumber: string;

    @Column()
    vatNumber: string;

    @Column()
    signatoryFullName: string;

    @Column()
    signatoryAddress: string;

    @Column()
    signatoryZipCode: string;

    @Column()
    signatoryCity: string;

    @Column()
    signatoryCountry: number;

    @Column()
    signatoryEmail: string;

    @Column()
    signatoryPhoneNumber: string;

    @Column('simple-array', { nullable: true })
    signatoryDocumentIds: string[];

    @Column()
    status: OrganizationStatus;

    @OneToMany(() => User, (user) => user.organization, { cascade: true, eager: true })
    users: User[];

    @OneToMany(() => Invitation, (entity) => entity.organization, { eager: true })
    invitations: Invitation[];

    @OneToMany(() => Device, (device) => device.organization, { eager: true })
    devices: Device[];

    @Column('simple-array', { nullable: true })
    documentIds: string[];
}
