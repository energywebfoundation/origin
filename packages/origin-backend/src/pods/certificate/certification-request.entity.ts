import { BigNumber } from 'ethers/utils';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import {
    CertificationRequestOffChainData,
    MAX_ENERGY_PER_CERTIFICATE
} from '@energyweb/origin-backend-core';
import { IsPositive, Min, Max } from 'class-validator';
import { ExtendedBaseEntity } from '../ExtendedBaseEntity';

@Entity()
export class CertificationRequest extends ExtendedBaseEntity
    implements CertificationRequestOffChainData {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'bigint' })
    @IsPositive()
    @Min(0)
    @Max(MAX_ENERGY_PER_CERTIFICATE)
    energy: BigNumber;

    @Column('simple-array')
    files: string[];
}
