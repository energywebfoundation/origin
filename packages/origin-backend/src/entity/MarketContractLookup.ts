import { Entity, PrimaryColumn, BaseEntity } from 'typeorm';

@Entity()
export class MarketContractLookup extends BaseEntity {
    @PrimaryColumn('varchar', { length: 42 })
    address: string;
}