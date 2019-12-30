import { Entity, PrimaryColumn, BaseEntity, Unique } from 'typeorm';

@Entity()
@Unique(['address'])
export class MarketContractLookup extends BaseEntity {
    @PrimaryColumn('varchar', { length: 42 })
    address: string;
}