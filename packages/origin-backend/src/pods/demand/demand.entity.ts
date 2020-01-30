import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';
import { IsInt, Min, IsBoolean } from 'class-validator';
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

    @Column("simple-array")
    location?: string[];

    @Column("simple-array")
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

    @Column("simple-array")
    vintage?: [number, number];

    @Column("simple-array")
    demandPartiallyFilledEvents: string[];
}
