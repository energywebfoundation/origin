import {
    IOwnershipCommitment,
    IOwnershipCommitmentProofWithTx
} from '@energyweb/origin-backend-core';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { PreciseProofs } from 'precise-proofs-js';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import { Certificate } from './certificate.entity';

@Entity()
export class OwnershipCommitment extends ExtendedBaseEntity
    implements IOwnershipCommitmentProofWithTx {
    @PrimaryColumn()
    rootHash: string;

    @Column('simple-json')
    commitment: IOwnershipCommitment;

    @Column('simple-json')
    leafs: PreciseProofs.Leaf[];

    @Column('simple-array')
    salts: string[];

    @ManyToOne(() => Certificate, (cert) => cert.ownershipHistory)
    certificate: Certificate;

    @Column()
    txHash: string;
}
