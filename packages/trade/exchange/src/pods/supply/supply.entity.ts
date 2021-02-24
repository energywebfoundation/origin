import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DB_TABLE_PREFIX } from '../../utils/tablePrefix';

@Entity({ name: `${DB_TABLE_PREFIX}_supply` })
export class Supply extends ExtendedBaseEntity {
    constructor(supply: Partial<Supply>) {
        super();
        Object.assign(this, supply);
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    ownerId: string;

    @Column()
    deviceId: string;

    @Column()
    active: boolean;

    @Column()
    price: number;
}
