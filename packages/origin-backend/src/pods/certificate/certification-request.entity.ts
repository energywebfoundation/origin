import {
    Entity,
    Column,
    BaseEntity,
    PrimaryGeneratedColumn
} from 'typeorm';
import { CertificationRequestOffChainData } from '@energyweb/origin-backend-core';
import { IsInt, Min } from 'class-validator';

@Entity()
export class CertificationRequest extends BaseEntity implements CertificationRequestOffChainData {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @IsInt()
    @Min(0)
    energy: number;

    @Column('simple-array')
    files: string[];
}
