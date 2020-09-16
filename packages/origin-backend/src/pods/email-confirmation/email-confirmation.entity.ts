import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';

import { IEmailConfirmation } from '@energyweb/origin-backend-core';
import { ExtendedBaseEntity } from '../ExtendedBaseEntity';
import { User } from '../user/user.entity';

@Entity()
export class EmailConfirmation extends ExtendedBaseEntity implements IEmailConfirmation {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User)
    @JoinColumn()
    user: User;

    @Column()
    confirmed: boolean;

    @Column()
    token: string;

    @Column()
    expiryTimestamp: number;
}
