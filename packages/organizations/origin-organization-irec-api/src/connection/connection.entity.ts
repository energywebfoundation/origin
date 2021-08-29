import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { Registration } from '../registration';

@Entity({ name: 'irec_connection' })
export class Connection extends ExtendedBaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @IsNotEmpty()
    @IsString()
    userName: string;

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

    @OneToOne(() => Registration)
    @JoinColumn()
    @IsNotEmpty()
    registration: Registration;

    @Column()
    @IsNotEmpty()
    @IsString()
    clientId: string;

    @Column()
    @IsNotEmpty()
    @IsString()
    clientSecret: string;

    @Column({ default: true })
    @IsNotEmpty()
    @IsBoolean()
    active: boolean;

    @Column({ default: 0 })
    @IsNotEmpty()
    @IsNumber()
    attempts: number;
}
