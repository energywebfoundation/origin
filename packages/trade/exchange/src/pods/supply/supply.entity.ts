import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { DB_TABLE_PREFIX } from '../../utils/tablePrefix';

@Entity({ name: `${DB_TABLE_PREFIX}_supply` })
export class Supply extends ExtendedBaseEntity {
    constructor(supply: Partial<Supply>) {
        super();
        Object.assign(this, supply);
    }

    @ApiProperty({ type: String })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ type: String })
    @Column()
    ownerId: string;

    @ApiProperty({ type: String })
    @Column()
    deviceId: string;

    @ApiProperty({ type: Boolean })
    @Column()
    active: boolean;

    @Column()
    price: number;
}
