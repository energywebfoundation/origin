import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { TimeFrame, DemandStatus } from '@energyweb/utils-general';
import BN from 'bn.js';
import { Transform } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { DB_TABLE_PREFIX } from '../../utils/tablePrefix';

import { BNTransformer } from '../../utils/valueTransformers';
import { Order } from '../order/order.entity';
import { ApiProperty } from '@nestjs/swagger';

export interface IDemand {
    id: string;
    userId: string;
    price: number;
    start: Date;
    end: Date;
    volumePerPeriod: BN;
    periodTimeFrame: TimeFrame;
    product: any;
    bids: Order[];
    status: DemandStatus;
}

@Entity({ name: `${DB_TABLE_PREFIX}_demand` })
export class Demand extends ExtendedBaseEntity implements IDemand {
    @ApiProperty({ type: String })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ type: String })
    @Column()
    userId: string;

    @ApiProperty({ type: Number })
    @Column()
    price: number;

    @ApiProperty({ type: String })
    @Column({ type: 'timestamptz' })
    start: Date;

    @ApiProperty({ type: String })
    @Column({ type: 'timestamptz' })
    end: Date;

    @ApiProperty({ type: String })
    @Column('bigint', { transformer: BNTransformer })
    @Transform((v: BN) => v.toString(10))
    volumePerPeriod: BN;

    @ApiProperty({ type: TimeFrame })
    @Column()
    @IsEnum(TimeFrame)
    periodTimeFrame: TimeFrame;

    @ApiProperty({ type: String })
    @Column('json')
    product: any;

    @ApiProperty({ type: () => [Order] })
    @OneToMany(() => Order, (order) => order.demand, {
        eager: true
    })
    bids: Order[];

    @ApiProperty({ type: DemandStatus })
    @Column()
    status: DemandStatus;
}
