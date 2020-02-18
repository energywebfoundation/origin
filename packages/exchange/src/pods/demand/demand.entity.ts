import BN from 'bn.js';
import {
    BaseEntity,
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

import { BNTransformer } from '../../utils/valueTransformers';
import { Order } from '../order/order.entity';
import { ProductDTO } from '../order/product.dto';
import { Trade } from '../trade/trade.entity';

@Entity()
export class Demand extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    price: number;

    @Column()
    @UpdateDateColumn({ type: 'timestamptz' })
    start: Date;

    @Column('bigint', { transformer: BNTransformer })
    volumePerPeriod: BN;

    @Column()
    periods: number;

    @Column({ nullable: true })
    timeFrame: number;

    @Column('json')
    product: ProductDTO;

    @ManyToMany(() => Order, {
        eager: true
    })
    @JoinTable()
    bids: Order[];

    @ManyToMany(() => Trade, {
        eager: true,
        cascade: true
    })
    @JoinTable()
    trades: Trade[];
}
