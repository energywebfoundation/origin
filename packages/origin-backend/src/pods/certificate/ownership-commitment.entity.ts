import { PreciseProofs } from 'precise-proofs-js';
import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import {
    OwnershipCommitmentProofWithTx,
    IOwnershipCommitment
} from '@energyweb/origin-backend-core';
import { Certificate } from './certificate.entity';
import { ExtendedBaseEntity } from '../ExtendedBaseEntity';

@Entity()
export class OwnershipCommitment extends ExtendedBaseEntity implements OwnershipCommitmentProofWithTx {
    @PrimaryColumn()
    rootHash: string;

    @Column('simple-json')
    commitment: IOwnershipCommitment;

    @Column('simple-json')
    leafs: PreciseProofs.Leaf[];

    @Column('simple-array')
    salts: string[];

    @ManyToOne(
        () => Certificate,
        cert => cert.ownershipHistory
    )
    certificate: Certificate;

    @Column()
    txHash: string;
}
