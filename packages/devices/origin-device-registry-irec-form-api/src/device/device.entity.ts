import {
    DeviceStatus,
    IDevice,
    IExternalDeviceId,
    ISmartMeterRead
} from '@energyweb/origin-backend-core';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import {
    IsEnum,
    IsInt,
    IsLatitude,
    IsLongitude,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min
} from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Device extends ExtendedBaseEntity implements IDevice {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, default: DeviceStatus.Submitted })
    @IsNotEmpty()
    @IsEnum(DeviceStatus)
    status: DeviceStatus;

    @Column()
    @IsString()
    facilityName: string;

    @Column()
    @IsString()
    description: string;

    @Column()
    @IsString()
    images: string;

    @Column({ default: '[]' })
    @IsOptional()
    files: string;

    @Column()
    @IsString()
    address: string;

    @Column()
    @IsString()
    region: string;

    @Column()
    @IsString()
    province: string;

    @Column()
    @IsString()
    country: string;

    @Column()
    @IsInt()
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
    @IsString()
    timezone: string;

    @Column()
    @IsString()
    deviceType: string;

    @Column()
    @IsString()
    complianceRegistry: string;

    @Column()
    @IsString()
    otherGreenAttributes: string;

    @Column()
    @IsString()
    typeOfPublicSupport: string;

    @Column()
    @IsString()
    deviceGroup: string;

    @Column('simple-json')
    @IsOptional()
    smartMeterReads?: ISmartMeterRead[];

    @Column('simple-json', { nullable: true })
    @IsOptional()
    externalDeviceIds: IExternalDeviceId[];

    @IsNotEmpty()
    @Column()
    organizationId: number;

    @Column({ nullable: true })
    @IsOptional()
    @IsString()
    gridOperator: string;
}
