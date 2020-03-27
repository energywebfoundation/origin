import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsInt, Min, IsBoolean, IsOptional } from 'class-validator';
import {
    DemandStatus,
    IDemandProperties,
    DemandPartiallyFilled
} from '@energyweb/origin-backend-core';
import { ExtendedBaseEntity } from '../ExtendedBaseEntity';

@Entity()
export class Demand extends ExtendedBaseEntity implements IDemandProperties {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    owner: string;

    @Column()
    @IsInt()
    status: DemandStatus;

    @Column()
    startTime: number;

    @Column()
    endTime: number;

    @Column()
    @IsInt()
    @Min(0)
    timeFrame: number;

    @Column()
    @Min(0)
    maxPriceInCentsPerMwh: number;

    @Column()
    currency: string;

    @Column()
    @Min(0)
    energyPerTimeFrame: number;

    @Column()
    @IsBoolean()
    automaticMatching: boolean;

    @Column('simple-array')
    location?: string[];

    @Column('simple-array')
    deviceType?: string[];

    @Column()
    otherGreenAttributes?: string;

    @Column()
    typeOfPublicSupport?: string;

    @Column()
    registryCompliance?: string;

    @Column({ default: false })
    @IsOptional()
    @IsBoolean()
    procureFromSingleFacility?: boolean;

    @Column('simple-array')
    vintage?: [number, number];

    @Column('simple-json')
    demandPartiallyFilledEvents: DemandPartiallyFilled[];
}
