import { Product } from '@energyweb/exchange-core';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Order extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    status: number;

    @Column()
    startVolume: number;

    @Column()
    currentVolume: number;

    @Column()
    side: number;

    @Column()
    price: number;

    @Column()
    @UpdateDateColumn({ type: 'timestamptz' })
    validFrom: Date;

    @Column('json')
    product: Product;
}
