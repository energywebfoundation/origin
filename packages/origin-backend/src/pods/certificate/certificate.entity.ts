import { Entity, PrimaryColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { ICertificateOwnership } from '@energyweb/origin-backend-core';
import { OwnershipCommitment } from './ownership-commitment.entity';
import { ExtendedBaseEntity } from '../ExtendedBaseEntity';

@Entity()
export class Certificate extends ExtendedBaseEntity implements ICertificateOwnership {
    @PrimaryColumn()
    id: number;

    @OneToOne(() => OwnershipCommitment)
    @JoinColumn()
    currentOwnershipCommitment: OwnershipCommitment;

    @OneToOne(() => OwnershipCommitment, { nullable: true })
    @JoinColumn()
    pendingOwnershipCommitment: OwnershipCommitment;

    @OneToMany(
        () => OwnershipCommitment,
        commitment => commitment.certificate
    )
    ownershipHistory: OwnershipCommitment[];
}
