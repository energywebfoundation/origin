import BN from 'bn.js';
import { Column, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { BNTransformer } from '../../utils/valueTransformers';
import { Order } from '../order/order.entity';
import { ExtendedBaseEntity } from '@energyweb/origin-backend';

@Entity()
export class Trade extends ExtendedBaseEntity {
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
