import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import BN from 'bn.js';
import { Transform, Expose } from 'class-transformer';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { BNTransformer } from '../../utils/valueTransformers';
import { Bundle } from './bundle.entity';
import { BundleTradeItemDTO } from './bundle-trade-item.dto';

@Entity()
export class BundleTrade extends ExtendedBaseEntity {
    constructor(trade: Partial<BundleTrade>) {
        super();
        Object.assign(this, trade);
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    buyerId: string;

    @Column('varchar', { transformer: BNTransformer })
    @Transform((v: BN) => v.toString(10), { toPlainOnly: true })
    volume: BN;

    @ManyToOne(() => Bundle, { eager: true })
    bundle: Bundle;

    @Expose()
    get items(): BundleTradeItemDTO[] {
        return this.bundle.items.map(
            (item) =>
                new BundleTradeItemDTO(
                    item.asset,
                    item.startVolume.mul(this.volume).div(this.bundle.volume)
                )
        );
    }
}
