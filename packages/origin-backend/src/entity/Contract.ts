import { Entity, PrimaryColumn, Unique, BaseEntity, OneToMany } from 'typeorm';
import { AnyEntity } from './AnyEntity';

@Entity()
@Unique(['address'])
export class Contract extends BaseEntity {
    @PrimaryColumn()
    address: string;

    @OneToMany(type => AnyEntity, entity => entity.contract)
    entities: AnyEntity[];
}