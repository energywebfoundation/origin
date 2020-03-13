import { Entity, Column, BaseEntity, PrimaryColumn, Unique } from 'typeorm';

@Entity()
@Unique(['name'])
export class Country extends BaseEntity {
    @PrimaryColumn()
    name: string;

    @Column('varchar')
    regions: string;
}
