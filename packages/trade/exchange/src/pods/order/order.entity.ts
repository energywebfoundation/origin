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
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';

import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { BNTransformer } from '../../utils/valueTransformers';
import { Asset } from '../asset/asset.entity';
import { Demand } from '../demand/demand.entity';
import { Trade } from '../trade/trade.entity';
import { OrderType } from './order-type.enum';

import { DB_TABLE_PREFIX } from '../../utils/tablePrefix';

@Entity({ name: `${DB_TABLE_PREFIX}_order` })
export class Order extends ExtendedBaseEntity {
    constructor(order: Partial<Order>) {
        super();
        Object.assign(this, order);
    }

    @ApiProperty({ type: String })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ type: String })
    @Column()
    @IsNotEmpty()
    @IsString()
    userId: string;

    @ApiProperty({ enum: OrderStatus, enumName: 'OrderStatus' })
    @Column()
    @IsNotEmpty()
    @IsEnum(OrderStatus)
    status: OrderStatus;

    @ApiProperty({ type: String })
    @Column('bigint', { transformer: BNTransformer })
    @Transform((v: BN) => v.toString(10))
    startVolume: BN;

    @ApiProperty({ type: String })
    @Column('bigint', { transformer: BNTransformer })
    @Transform((v: BN) => v.toString(10))
    currentVolume: BN;

    @ApiProperty({ enum: OrderSide, enumName: 'OrderSide' })
    @Column()
    @IsNotEmpty()
    @IsEnum(OrderSide)
    side: OrderSide;

    @ApiProperty({ type: Number })
    @Column()
    @IsNotEmpty()
    @IsNumber()
    price: number;

    @ApiProperty({ enum: OrderType, enumName: 'OrderType' })
    @Column({ default: OrderType.Limit })
    @IsEnum(OrderType)
    type: OrderType;

    @ApiProperty({ type: String })
    @Column({ nullable: true, type: 'uuid' })
    @IsOptional()
    @IsString()
    directBuyId: string;

    @ApiProperty({ type: String })
    @Column({ type: 'timestamptz' })
    validFrom: Date;

    @ApiProperty({ type: Object })
    @Column('json')
    product: any;

    @ApiProperty({ type: () => Asset })
    @ManyToOne(() => Asset, { eager: true })
    asset: Asset;

    @ApiProperty({ type: String })
    @RelationId((order: Order) => order.asset)
    assetId: string;

    @ManyToOne(() => Demand, (demand) => demand.bids)
    @JoinTable()
    @Exclude()
    demand: Demand;

    @ApiProperty({ type: String })
    @RelationId((order: Order) => order.demand)
    demandId: string;

    @ApiProperty({ type: () => [Trade] })
    @OneToMany(() => Trade, (trade) => trade.ask || trade.bid)
    @Exclude()
    trades: Trade[];
}
