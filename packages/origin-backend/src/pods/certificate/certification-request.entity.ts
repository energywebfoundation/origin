import {
    Entity,
    Column,
    BaseEntity,
    PrimaryGeneratedColumn
} from 'typeorm';
import { CertificationRequestOffChainData } from '@energyweb/origin-backend-core';

@Entity()
export class CertificationRequest extends BaseEntity implements CertificationRequestOffChainData {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('simple-array')
    files: string[];
}
