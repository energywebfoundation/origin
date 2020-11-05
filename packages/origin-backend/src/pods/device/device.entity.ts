import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { IsInt, Min, IsLatitude, IsLongitude, IsNotEmpty } from 'class-validator';
import { ISmartMeterRead, IExternalDeviceId, IDevice } from '@energyweb/origin-backend-core';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { Organization } from '../organization/organization.entity';

@Entity()
export class Device extends ExtendedBaseEntity implements IDevice {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    status: number;

    @Column()
    facilityName: string;

    @Column()
    description: string;

    @Column()
    images: string;

    @Column({ default: '[]' })
    files: string;

    @Column()
    address: string;

    @Column()
    region: string;

    @Column()
    province: string;

    @Column()
    country: string;

    @Column()
    @Min(0)
    operationalSince: number;

    @Column()
    @IsInt()
    @Min(0)
    capacityInW: number;

    @Column()
    @IsLatitude()
    gpsLatitude: string;

    @Column()
    @IsLongitude()
    gpsLongitude: string;

    @Column()
    timezone: string;

    @Column()
    deviceType: string;

    @Column()
    complianceRegistry: string;

    @Column()
    otherGreenAttributes: string;

    @Column()
    typeOfPublicSupport: string;

    @Column()
    deviceGroup: string;

    @Column('simple-json')
    smartMeterReads?: ISmartMeterRead[];

    @Column('simple-json', { nullable: true })
    externalDeviceIds: IExternalDeviceId[];

    @ManyToOne(() => Organization, (organization) => organization.devices, {
        nullable: false
    })
    @IsNotEmpty()
    organization: Organization;

    @Column({ nullable: true })
    gridOperator: string;

    @Column({ nullable: true })
    defaultAskPrice: number;

    @Column({ default: false })
    automaticPostForSale: boolean;
}
