import { DeviceState } from '@energyweb/issuer-irec-api-wrapper';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { DeviceDTO } from './dto';

@Entity({ name: 'irec_device_registry_device' })
export class Device extends ExtendedBaseEntity implements DeviceDTO {
    constructor(device: Partial<Device>) {
        super();
        Object.assign(this, device);
    }

    @ApiProperty({ type: String })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ type: String })
    @Column()
    ownerId: string;

    @ApiProperty({ type: String })
    @Column()
    code: string;

    @ApiProperty({ type: String })
    @Column()
    name: string;

    @ApiProperty({ type: String })
    @Column()
    defaultAccount: string;

    @ApiProperty({ type: String })
    @Column()
    deviceType: string;

    @ApiProperty({ type: String })
    @Column()
    fuelType: string;

    @ApiProperty({ type: String })
    @Column()
    countryCode: string;

    @ApiProperty({ type: String })
    @Column()
    registrantOrganization: string;

    @ApiProperty({ type: String })
    @Column()
    issuer: string;

    @ApiProperty({ type: Number })
    @Column()
    capacity: number;

    @ApiProperty({ type: Date })
    @Column()
    commissioningDate: Date;

    @ApiProperty({ type: Date })
    @Column()
    registrationDate: Date;

    @ApiProperty({ type: String })
    @Column()
    address: string;

    @ApiProperty({ type: String })
    @Column()
    latitude: string;

    @ApiProperty({ type: String })
    @Column()
    longitude: string;

    @ApiProperty({ type: String, nullable: true })
    @Column({ nullable: true })
    notes: string;

    @ApiProperty({ enum: DeviceState, enumName: 'DeviceState' })
    @Column({ nullable: false, default: DeviceState.Draft })
    status: DeviceState;

    @ApiProperty({ type: String })
    @Column()
    timezone: string;

    @ApiProperty({ type: String, nullable: true })
    @Column({ nullable: true })
    gridOperator: string;

    @Column()
    @IsString()
    postalCode: string;

    @Column()
    @IsString()
    country: string;

    @Column()
    @IsString()
    region: string;

    @Column({ default: '' })
    @IsString()
    subregion: string;
}
