import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';

@Entity({ name: 'irec_beneficiary' })
export class Beneficiary extends ExtendedBaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: string;
}
