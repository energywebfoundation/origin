import { Product } from '@energyweb/exchange-core';
import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

import { Order } from '../order/order.entity';
import { ExtendedBaseEntity } from '@energyweb/origin-backend';

@Entity()
export class Supply extends ExtendedBaseEntity {
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
    asks: Order[];
}
