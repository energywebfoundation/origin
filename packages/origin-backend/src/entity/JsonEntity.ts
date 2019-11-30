import { Entity, Column, BaseEntity, Unique, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@Unique(['type', 'contractAddress', 'identifier', 'hash'])
export class JsonEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar')
    type: string;

    @Column('varchar', { length: 42 })
    contractAddress: string;

    @Column('varchar')
    identifier: string;

    @Column('varchar')
    hash: string;

    @Column('varchar')
    value: string;
}