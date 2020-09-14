import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { IRECAccountType } from './account-type.enum';

@Entity({ name: 'irec_registration' })
export class Registration extends ExtendedBaseEntity {
    constructor(registration: Partial<Registration>) {
        super();
        Object.assign(this, registration);
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    owner: string;

    @Column()
    accountType: IRECAccountType;

    @Column()
    headquarterCountry: string;

    @Column()
    registrationYear: number;

    @Column()
    employeesNumber: string;

    @Column()
    shareholders: string;

    @Column()
    website: string;

    @Column('simple-array')
    activeCountries: string[];

    @Column()
    mainBusiness: string;

    @Column()
    ceoName: string;

    @Column()
    ceoPassportNumber: string;

    @Column()
    balanceSheetTotal: string;

    @Column({ nullable: true })
    subsidiaries?: string;
}
