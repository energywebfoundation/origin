import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinTable } from 'typeorm';

import { Order } from '../order/order.entity';

@Entity()
export class Trade extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('timestamptz')
    created: Date;

    @Column()
    volume: number;

    @Column()
    price: number;

    @ManyToOne(() => Order)
    @JoinTable()
    bid: Order;

    @ManyToOne(() => Order)
    @JoinTable()
    ask: Order;
}
