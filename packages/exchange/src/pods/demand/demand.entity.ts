import { ExtendedBaseEntity } from '@energyweb/origin-backend';
import { TimeFrame, DemandStatus } from '@energyweb/utils-general';
import BN from 'bn.js';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { BNTransformer } from '../../utils/valueTransformers';
import { Order } from '../order/order.entity';
import { ProductDTO } from '../order/product.dto';

@Entity()
export class Demand extends ExtendedBaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    price: number;

    @Column({ type: 'timestamptz' })
    start: Date;

    @Column({ type: 'timestamptz' })
    end: Date;

    @Column('bigint', { transformer: BNTransformer })
    volumePerPeriod: BN;

    @Column()
    periodTimeFrame: TimeFrame;

    @Column('json')
    product: ProductDTO;

    @OneToMany(() => Order, (order) => order.demand, {
        eager: true
    })
    bids: Order[];

    @Column()
    status: DemandStatus;
}
