import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { IsInt, IsEmail, Min, ValidateIf, IsNotEmpty, IsUrl } from 'class-validator';
import { OrganizationStatus, IOrganization } from '@energyweb/origin-backend-core';
import { User } from '../user/user.entity';
import { OrganizationInvitation } from './organizationInvitation.entity';
import { Device } from '../device/device.entity';
import { ExtendedBaseEntity } from '../ExtendedBaseEntity';

@Entity()
export class Organization extends ExtendedBaseEntity implements IOrganization {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    activeCountries: string;

    @Column()
    code: string;

    @Column()
    name: string;

    @Column()
    contact: string;

    @Column()
    telephone: string;

    @Column()
    @IsEmail()
    email: string;

    @Column()
    address: string;

    @Column()
    shareholders: string;

    @Column({
        nullable: true
    })
    @ValidateIf((o: Organization) => !o.companyNumber)
    @IsNotEmpty()
    ceoPassportNumber: string;

    @Column()
    ceoName: string;

    @Column({
        nullable: true
    })
    @ValidateIf((o: Organization) => !o.ceoPassportNumber)
    @IsNotEmpty()
    companyNumber: string;

    @Column()
    vatNumber: string;

    @Column()
    postcode: string;

    @Column()
    @IsInt()
    @Min(0)
    headquartersCountry: number;

    @Column()
    @IsInt()
    @Min(0)
    country: number;

    @Column()
    businessTypeSelect: string;

    @Column({
        nullable: true
    })
    businessTypeInput: string;

    @Column()
    @IsInt()
    @Min(1900)
    yearOfRegistration: number;

    @Column()
    @IsInt()
    @Min(0)
    numberOfEmployees: number;

    @Column()
    @IsUrl()
    website: string;

    @Column()
    status: OrganizationStatus;

    @OneToMany(() => User, (user) => user.organization, { cascade: true })
    users: User[];

    @OneToMany(() => OrganizationInvitation, (entity) => entity.organization)
    invitations: OrganizationInvitation[];

    @OneToMany(() => Device, (device) => device.organization)
    devices: Device[];

    @OneToOne(() => User)
    @JoinColumn()
    @IsNotEmpty()
    leadUser: User;
}
