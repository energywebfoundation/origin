import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { CertificationRequestOffChainData } from '@energyweb/origin-backend-core';
import { IsInt, Min } from 'class-validator';
import { ExtendedBaseEntity } from '../ExtendedBaseEntity';

@Entity()
export class CertificationRequest extends ExtendedBaseEntity implements CertificationRequestOffChainData {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsInt()
    @Min(0)
    energy: number;

    @Column('simple-array')
    files: string[];
}
