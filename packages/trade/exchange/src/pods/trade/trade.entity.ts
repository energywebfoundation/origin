import BN from 'bn.js';
import { Column, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';

import { BNTransformer } from '../../utils/valueTransformers';
import { Order } from '../order/order.entity';

import { DB_TABLE_PREFIX } from '../../utils/tablePrefix';

@Entity({ name: `${DB_TABLE_PREFIX}_trade` })
export class Trade extends ExtendedBaseEntity {
    constructor(partial: Partial<Trade>) {
        super();
        Object.assign(this, partial);
    }

    @ApiProperty({
        type: String,
        description: 'UUID string identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ type: String, example: 'Tue Nov 16 2021 16:09:43 GMT-0500' })
    @Column('timestamptz')
    created: Date;

    @ApiProperty({ type: String, example: '500' })
    @Column('bigint', { transformer: BNTransformer })
    volume: BN;

    @ApiProperty({ type: String })
    @Column()
    price: number;

    @ApiProperty({ type: () => Order })
    @ManyToOne(() => Order, { eager: true })
    @JoinTable()
    bid: Order;

    @ApiProperty({ type: () => Order })
    @ManyToOne(() => Order, { eager: true })
    @JoinTable()
    ask: Order;

    public withMaskedOrder(userId: string): Trade {
        return this.ask.userId === userId
            ? { ...this, bid: undefined }
            : { ...this, ask: undefined };
    }
}
