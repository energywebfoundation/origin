import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { IsOptional } from 'class-validator';

@Entity({ name: 'irec_beneficiary' })
export class Beneficiary extends ExtendedBaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    irecBeneficiaryId: number;

    @Column()
    @IsOptional()
    organizationId?: number;

    @Column()
    @IsOptional()
    ownerId?: number;

    @Column()
    name: string;

    @Column()
    countryCode: string;

    @Column()
    active: boolean;

    @Column()
    location: string;
}
