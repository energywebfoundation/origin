import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { IsString } from 'class-validator';

@Entity()
export class File extends ExtendedBaseEntity {
    constructor(partial: Partial<File>) {
        super();
        Object.assign(this, partial);
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @IsString()
    filename: string;

    @Column({ type: 'bytea' })
    data: Buffer;

    @Column()
    @IsString()
    contentType: string;

    @Column()
    @IsString()
    userId: string;

    @Column({ nullable: true })
    @IsString()
    organizationId: string;
}
