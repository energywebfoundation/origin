import { Entity, BaseEntity, PrimaryColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { ICertificateOwnership } from '@energyweb/origin-backend-core';
import { OwnershipCommitment } from './ownership-commitment.entity';

@Entity()
export class Certificate extends BaseEntity implements ICertificateOwnership {
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
