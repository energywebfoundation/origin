import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, Unique, ManyToOne } from 'typeorm';
import { Contract } from './Contract';
import { EntityType } from './EntityType';

@Entity()
@Unique(['identifier', 'type', 'contract'])
export class AnyEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => EntityType, entityType => entityType.entities)
    type: EntityType;

    @ManyToOne(type => Contract, contract => contract.entities)
    contract: Contract;

    @Column()
    identifier: string;

    @Column()
    value: string;
}