import { Entity, PrimaryColumn, BaseEntity, Unique } from 'typeorm';

@Entity()
@Unique(['code'])
export class Currency extends BaseEntity {
    @PrimaryColumn('varchar', { length: 3 })
    code: string;
}
