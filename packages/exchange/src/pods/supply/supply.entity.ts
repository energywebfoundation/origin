import { Product } from '@energyweb/exchange-core';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend';

import { Order } from '../order/order.entity';

@Entity()
export class Supply extends ExtendedBaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    price: number;

    @Column({ type: 'timestamptz' })
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
