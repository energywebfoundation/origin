import { Expose } from 'class-transformer';

export class Organisation {
    code: string;

    name: string;

    address: string;

    @Expose({ name: 'primary_contact' })
    primaryContact: string;

    telephone: string;

    email: string;

    @Expose({ name: 'reg_num' })
    regNum: string;

    @Expose({ name: 'vat_num' })
    vatNum: string;

    @Expose({ name: 'reg_address' })
    regAddress: string;

    country: string;

    roles: string[];
}
