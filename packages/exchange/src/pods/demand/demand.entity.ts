import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { TimeFrame, DemandStatus } from '@energyweb/utils-general';
import BN from 'bn.js';
import { Transform } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { BNTransformer } from '../../utils/valueTransformers';
import { Order } from '../order/order.entity';
import { ProductDTO } from '../order/product.dto';

export interface IDemand {
    id: string;
    userId: string;
    price: number;
    start: Date;
    end: Date;
    volumePerPeriod: BN;
    periodTimeFrame: TimeFrame;
    product: ProductDTO;
    bids: Order[];
    status: DemandStatus;
}

@Entity()
export class Demand extends ExtendedBaseEntity implements IDemand {
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
    @Transform((v: BN) => v.toString(10))
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
