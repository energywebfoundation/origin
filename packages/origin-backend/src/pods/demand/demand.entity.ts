import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';
import { IsInt, IsDate, Min, IsBoolean } from 'class-validator';
import { DemandStatus } from '@energyweb/origin-backend-core';

@Entity()
export class Demand extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    owner: string;

    @Column()
    @IsInt()
    status: DemandStatus;

    @Column()
    @IsDate()
    startTime: number;

    @Column()
    @IsDate()
    endTime: number;

    @Column()
    @IsInt()
    @Min(0)
    timeFrame: number;

    @Column()
    @Min(0)
    maxPriceInCentsPerMwh: number;

    @Column()
    @Min(0)
    currency: string;
    
    @Column()
    @Min(0)
    energyPerTimeFrame: number;

    @Column()
    @IsBoolean()
    automaticMatching: boolean;

    @Column()
    location?: string[];

    @Column()
    deviceType?: string[];

    @Column()
    @Min(0)
    minCO2Offset?: number;

    @Column()
    otherGreenAttributes?: string;

    @Column()
    typeOfPublicSupport?: string;

    @Column()
    registryCompliance?: string;

    @Column()
    @IsBoolean()
    procureFromSingleFacility?: boolean;

    @Column()
    vintage?: [number, number];

    @Column("simple-array")
    demandPartiallyFilledEvents: string[];
}
