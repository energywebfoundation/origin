import { Entity, PrimaryColumn, Unique, BaseEntity } from 'typeorm';

@Entity()
@Unique(['address'])
export class MarketContractLookup extends BaseEntity {
    @PrimaryColumn()
    address: string;
}