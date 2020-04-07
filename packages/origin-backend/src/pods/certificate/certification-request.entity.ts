import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { CertificationRequestOffChainData } from '@energyweb/origin-backend-core';
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
    @Max(1e16)
    energy: number;

    @Column('simple-array')
    files: string[];
}
