import { OrderSide, OrderStatus } from '@energyweb/exchange-core';
import BN from 'bn.js';
import { Exclude, Transform } from 'class-transformer';
import {
    Column,
    Entity,
    JoinTable,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    RelationId
} from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend';

import { BNTransformer } from '../../utils/valueTransformers';
import { Asset } from '../asset/asset.entity';
import { Demand } from '../demand/demand.entity';
import { Trade } from '../trade/trade.entity';
import { OrderType } from './order-type.enum';
import { ProductDTO } from './product.dto';

@Entity()
export class Order extends ExtendedBaseEntity {
    constructor(order: Partial<Order>) {
        super();
        Object.assign(this, order);
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    status: OrderStatus;

    @Column('bigint', { transformer: BNTransformer })
    @Transform((v: BN) => v.toString(10))
    startVolume: BN;

    @Column('bigint', { transformer: BNTransformer })
    @Transform((v: BN) => v.toString(10))
    currentVolume: BN;

    @Column()
    side: OrderSide;

    @Column()
    price: number;

    @Column({ default: OrderType.Limit })
    type: OrderType;

    @Column({ nullable: true, type: 'uuid' })
    directBuyId: string;

    @Column({ type: 'timestamptz' })
    validFrom: Date;

    @Column('json')
    product: ProductDTO;

    @ManyToOne(() => Asset, { eager: true })
    asset: Asset;

    @RelationId((order: Order) => order.asset)
    assetId: string;

    @ManyToOne(() => Demand, (demand) => demand.bids)
    @JoinTable()
    @Exclude()
    demand: Demand;

    @RelationId((order: Order) => order.demand)
    demandId: string;

    @OneToMany(() => Trade, (trade) => trade.ask || trade.bid)
    @Exclude()
    trades: Trade[];
}
