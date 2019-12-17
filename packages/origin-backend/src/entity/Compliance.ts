import { Entity, PrimaryColumn, BaseEntity, Unique } from 'typeorm';

@Entity()
@Unique(['standard'])
export class Compliance extends BaseEntity {
    @PrimaryColumn('varchar', { length: 3 })
    standard: string;
}