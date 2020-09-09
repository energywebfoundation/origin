import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';

@Entity({ name: 'irec_connect' })
export class Connect extends ExtendedBaseEntity {
    constructor(registration: Partial<Connect>) {
        super();
        Object.assign(this, registration);
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    owner: string;

    @Column()
    code: string;

    @Column()
    leadUserFullName: string;

    @Column()
    leadUserEmail: string;
}
