import { Entity, Column, BaseEntity, PrimaryColumn } from 'typeorm';
import { IsInt, IsDate, Min, IsLatitude, IsLongitude } from 'class-validator';

@Entity()
export class Device extends BaseEntity {
    @PrimaryColumn()
    id: number;

    @Column()
    status: number;

    @Column()
    facilityName: string;

    @Column()
    description: string;

    @Column()
    images: string;

    @Column()
    address: string;

    @Column()
    region: string;

    @Column()
    province: string;

    @Column()
    @IsInt()
    @Min(0)
    country: number;

    @Column()
    @Min(0)
    operationalSince: number;

    @Column()
    @IsInt()
    @Min(0)
    capacityInW: number

    @Column()
    @IsLatitude()
    gpsLatitude: string;

    @Column()
    @IsLongitude()
    gpsLongitude: string;

    @Column()
    timezone: string;
}
