import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { IsString } from 'class-validator';
import { DB_TABLE_PREFIX } from '../../utils/tablePrefix';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: `${DB_TABLE_PREFIX}_account` })
export class Account extends ExtendedBaseEntity {
    @ApiProperty({ type: String })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ type: String })
    @Column()
    @IsString()
    userId: string;

    @ApiProperty({ type: String })
    @Column()
    @IsString()
    address: string;
}
