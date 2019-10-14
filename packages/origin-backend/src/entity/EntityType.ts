import { Entity, PrimaryColumn, BaseEntity, OneToMany } from 'typeorm';
import { AnyEntity } from './AnyEntity';

@Entity()
export class EntityType extends BaseEntity {
    @PrimaryColumn()
    name: string;

    @OneToMany(type => AnyEntity, entity => entity.type)
    entities: AnyEntity[];
}