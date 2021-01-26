import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';

import { BlockchainAccountType, IBlockchainAccount } from '@energyweb/origin-backend-core';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { IsEnum } from 'class-validator';
import { User } from './user.entity';

@Entity()
export class BlockchainAccount extends ExtendedBaseEntity implements IBlockchainAccount {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({ unique: true })
    address: string;

    @Column()
    @IsEnum(BlockchainAccountType)
    type: BlockchainAccountType;

    @Column({ nullable: true })
    signedMessage?: string;

    @ManyToMany(() => User, (user) => user.blockchainAccounts)
    users: User[];
}
