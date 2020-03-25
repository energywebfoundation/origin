import { PreciseProofs } from 'precise-proofs-js';
import { Entity, Column, BaseEntity, PrimaryColumn, ManyToOne } from 'typeorm';
import { OwnershipCommitmentProofWithTx, IOwnershipCommitment } from '@energyweb/origin-backend-core';
import { Certificate } from './certificate.entity';

@Entity()
export class OwnershipCommitment extends BaseEntity implements OwnershipCommitmentProofWithTx {
    @PrimaryColumn()
    rootHash: string;

    @Column('simple-json')
    commitment: IOwnershipCommitment;

    @Column('simple-json')
    leafs: PreciseProofs.Leaf[];

    @Column('simple-array')
    salts: string[];

    @ManyToOne(type => Certificate, cert => cert.ownershipHistory)
    certificate: Certificate;

    @Column()
    txHash: string;
}
