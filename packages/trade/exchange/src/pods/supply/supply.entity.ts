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

    @ApiProperty({
        type: String,
        description: 'UUID string identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ type: String })
    @Column()
    ownerId: string;

    @ApiProperty({ type: String, example: 'Dev1-A' })
    @Column()
    deviceId: string;

    @ApiProperty({ type: Boolean })
    @Column()
    active: boolean;

    @Column()
    price: number;
}
