import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';

import { IBeneficiary } from './dto/beneficiary.dto';

@Entity({ name: 'irec_beneficiary' })
export class Beneficiary extends ExtendedBaseEntity implements IBeneficiary {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    irecBeneficiaryId: number;

    @Column()
    organizationId: number;

    @Column()
    active: true;
}
