import { Entity, Column, BaseEntity, Unique, PrimaryGeneratedColumn } from 'typeorm';
import { IContractsLookup } from '@energyweb/origin-backend-core';

@Entity()
@Unique(['userLogic', 'deviceLogic', 'registry', 'issuer'])
export class ContractsLookup extends BaseEntity implements IContractsLookup {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 42 })
    userLogic: string;

    @Column('varchar', { length: 42 })
    deviceLogic: string;

    @Column('varchar', { length: 42 })
    registry: string;

    @Column('varchar', { length: 42 })
    issuer: string;
}
