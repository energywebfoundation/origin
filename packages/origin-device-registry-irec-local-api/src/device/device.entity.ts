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

    @Column()
    code: string;

    @Column()
    name: string;

    @Column()
    defaultAccount: string;

    @Column()
    deviceType: string;

    @Column()
    fuel: string;

    @Column()
    countryCode: string;

    @Column()
    registrantOrganization: string;

    @Column()
    issuer: string;

    @Column()
    capacity: number;

    @Column()
    commissioningDate: Date;

    @Column()
    registrationDate: Date;

    @Column()
    address: string;

    @Column()
    latitude: string;

    @Column()
    longitude: string;

    @Column({ nullable: true })
    notes: string;

    @Column({ nullable: false, default: DeviceStatus.Submitted })
    status: DeviceStatus;

    @Column()
    timezone: string;

    @Column({ nullable: true })
    gridOperator: string;
}
