import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { IsString } from 'class-validator';
import { DB_TABLE_PREFIX } from '../../utils/tablePrefix';

@Entity({ name: `${DB_TABLE_PREFIX}_account` })
export class Account extends ExtendedBaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @IsString()
    userId: string;

    @Column()
    @IsString()
    address: string;
}
