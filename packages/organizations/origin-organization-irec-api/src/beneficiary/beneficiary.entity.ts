import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';

export interface IBeneficiary {
    id: number;
    irecBeneficiaryId: number;
    organizationId: number;
    ownerOrganizationId: number;
    active: boolean;
}

@Entity({ name: 'irec_beneficiary' })
export class Beneficiary extends ExtendedBaseEntity implements IBeneficiary {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    irecBeneficiaryId: number;

    @Column()
    organizationId: number;

    @Column()
    ownerOrganizationId: number;

    @Column()
    active: true;
}
