import { Entity, Column, BaseEntity, PrimaryColumn, Unique } from 'typeorm';

@Entity()
@Unique(['hash'])
export class JsonEntity extends BaseEntity {
    @PrimaryColumn()
    hash: string;

    @Column('varchar')
    value: string;
}
