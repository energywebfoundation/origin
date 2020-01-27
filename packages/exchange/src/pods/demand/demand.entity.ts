import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    UpdateDateColumn,
    JoinTable,
    ManyToMany
} from 'typeorm';
import { Product } from '@energyweb/exchange-core';
import { Order } from '../order/order.entity';
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

    @Column()
    volumePerPeriod: number;

    @Column()
    periods: number;

    @Column({ nullable: true })
    timeFrame: number;

    @Column('json')
    product: Product;

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
