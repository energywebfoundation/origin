import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, Unique, ManyToOne } from 'typeorm';
import { EntityType } from './EntityType';

@Entity()
@Unique(['identifier', 'type', 'contractAddress'])
export class AnyEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => EntityType, entityType => entityType.entities)
    type: EntityType;

    @Column()
    contractAddress: string;

    @Column()
    identifier: string;

    @Column()
    value: string;
}