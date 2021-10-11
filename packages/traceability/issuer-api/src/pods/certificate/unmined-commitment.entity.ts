import { Column, Entity, PrimaryColumn } from 'typeorm';
import { IOwnershipCommitmentProof } from '@energyweb/issuer';

export const UNMINED_COMMITMENT_TABLE_NAME = 'issuer_unmined_commitment';

/**
 * Used as temporary storage for private certificate commitments,
 * while we wait for the private certificate transaction to be mined.
 */
@Entity({ name: UNMINED_COMMITMENT_TABLE_NAME })
export class UnminedCommitment {
    @PrimaryColumn()
    txHash: string;

    @Column('simple-json', { nullable: true })
    commitment: IOwnershipCommitmentProof;
}
