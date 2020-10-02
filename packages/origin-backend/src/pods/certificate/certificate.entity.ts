import { ICertificateOwnership } from '@energyweb/origin-backend-core';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';

import { OwnershipCommitment } from './ownership-commitment.entity';

@Entity()
export class Certificate extends ExtendedBaseEntity implements ICertificateOwnership {
    @PrimaryColumn()
    id: number;

    @Column('varchar')
    originalRequestor: string;

    @OneToOne(() => OwnershipCommitment, { nullable: true })
    @JoinColumn()
    currentOwnershipCommitment: OwnershipCommitment;

    @OneToOne(() => OwnershipCommitment, { nullable: true })
    @JoinColumn()
    pendingOwnershipCommitment: OwnershipCommitment;

    @OneToMany(() => OwnershipCommitment, (commitment) => commitment.certificate)
    ownershipHistory: OwnershipCommitment[];
}
