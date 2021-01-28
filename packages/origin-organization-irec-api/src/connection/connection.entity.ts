import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

@Entity({ name: 'irec_connection' })
export class Connection extends ExtendedBaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @IsNotEmpty()
    @IsString()
    accessToken: string;

    @Column()
    @IsNotEmpty()
    @IsString()
    refreshToken: string;

    @Column('timestamptz')
    @IsNotEmpty()
    @IsDate()
    expiryDate: Date;
}
