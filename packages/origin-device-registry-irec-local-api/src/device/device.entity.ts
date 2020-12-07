import { DeviceStatus } from '@energyweb/origin-backend-core';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'irec_device_registry_device' })
export class Device extends ExtendedBaseEntity {
    constructor(device: Partial<Device>) {
        super();
        Object.assign(this, device);
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    ownerId: string;

    @Column({ nullable: false, default: DeviceStatus.Submitted })
    status: DeviceStatus;

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
    operationalSince: number;

    @Column()
    capacityInW: number;

    @Column()
    gpsLatitude: string;

    @Column()
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

    @Column({ nullable: true })
    gridOperator: string;
}
