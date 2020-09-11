import BN from 'bn.js';
import { Column, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';

import { BNTransformer } from '../../utils/valueTransformers';
import { Order } from '../order/order.entity';

@Entity()
export class Trade extends ExtendedBaseEntity {
    constructor(partial: Partial<Trade>) {
        super();
        Object.assign(this, partial);
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('timestamptz')
    created: Date;

    @Column('bigint', { transformer: BNTransformer })
    volume: BN;

    @Column()
    price: number;

    @ManyToOne(() => Order, { eager: true })
    @JoinTable()
    bid: Order;

    @ManyToOne(() => Order, { eager: true })
    @JoinTable()
    ask: Order;

    public withMaskedOrder(userId: string): Trade {
        return this.ask.userId === userId
            ? { ...this, bid: undefined }
            : { ...this, ask: undefined };
    }
}
