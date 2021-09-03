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

    @Column({ unique: true })
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

    @Column({ default: '' })
    primaryContactOrganizationName: string;

    @Column({ default: '' })
    primaryContactOrganizationAddress: string;

    @Column({ default: '' })
    primaryContactOrganizationPostalCode: string;

    @Column({ default: '' })
    primaryContactOrganizationCountry: string;

    @Column({ default: '' })
    primaryContactName: string;

    @Column({ default: '' })
    primaryContactEmail: string;

    @Column({ default: '' })
    primaryContactPhoneNumber: string;

    @Column({ default: '' })
    primaryContactFax: string;

    @Column({ default: '' })
    leadUserTitle: string;

    @Column({ default: '' })
    leadUserFirstName: string;

    @Column({ default: '' })
    leadUserLastName: string;

    @Column({ default: '' })
    leadUserEmail: string;

    @Column({ default: '' })
    leadUserPhoneNumber: string;

    @Column({ default: '' })
    leadUserFax: string;
}
