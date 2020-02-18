import BN from 'bn.js';
import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

import { BNTransformer } from '../../utils/valueTransformers';
import { Asset } from '../asset/asset.entity';
import { ProductDTO } from './product.dto';

@Entity()
export class Order extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    status: number;

    @Column('bigint', { transformer: BNTransformer })
    startVolume: BN;

    @Column('bigint', { transformer: BNTransformer })
    currentVolume: BN;

    @Column()
    side: number;

    @Column()
    price: number;

    @Column()
    @UpdateDateColumn({ type: 'timestamptz' })
    validFrom: Date;

    @Column('json')
    product: ProductDTO;

    @ManyToOne(() => Asset)
    asset: Asset;
}
