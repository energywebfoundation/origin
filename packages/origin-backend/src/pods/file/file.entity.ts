import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';

@Entity()
export class File extends ExtendedBaseEntity {
    constructor(partial: Partial<File>) {
        super();
        Object.assign(this, partial);
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    filename: string;

    @Column({ type: 'bytea' })
    data: Buffer;

    @Column()
    contentType: string;

    @Column()
    userId: string;

    @Column({ nullable: true })
    organizationId: string;
}
