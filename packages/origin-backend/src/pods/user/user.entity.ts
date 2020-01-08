import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, Unique } from 'typeorm';
import { Length, IsNotEmpty } from 'class-validator';
import bcrypt from 'bcryptjs';
import { IUser } from '@energyweb/origin-backend-core';

@Entity()
@Unique(['email'])
export class User extends BaseEntity implements IUser {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    @IsNotEmpty()
    email: string;

    @Column()
    telephone: string;

    @Column()
    @Length(4, 100)
    password: string;

    checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
        return bcrypt.compareSync(unencryptedPassword, this.password);
    }
}
