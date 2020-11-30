import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';

import { IEmailConfirmation } from '@energyweb/origin-backend-core';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { IsBoolean, IsInt, IsString, Min } from 'class-validator';
import { User } from '../user/user.entity';

@Entity()
export class EmailConfirmation extends ExtendedBaseEntity implements IEmailConfirmation {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User)
    @JoinColumn()
    user: User;

    @Column()
    @IsBoolean()
    confirmed: boolean;

    @Column()
    @IsString()
    token: string;

    @Column()
    @IsInt()
    @Min(0)
    expiryTimestamp: number;
}
