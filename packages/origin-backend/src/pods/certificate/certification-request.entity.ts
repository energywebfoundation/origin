import { BigNumber } from 'ethers/utils';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { CertificationRequestOffChainData } from '@energyweb/origin-backend-core';
import { ExtendedBaseEntity } from '../ExtendedBaseEntity';
import { BigNumberTransformer } from '../../utils/transformers';

@Entity()
export class CertificationRequest extends ExtendedBaseEntity
    implements CertificationRequestOffChainData {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('bigint', { transformer: BigNumberTransformer })
    energy: BigNumber;

    @Column('simple-array')
    files: string[];
}
