import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';
import { IsInt, IsEmail, Min, ValidateIf, IsNotEmpty, IsUrl } from 'class-validator';

@Entity()
export class Organization extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    code: string;

    @Column()
    name: string;

    @Column()
    contact: string;

    @Column()
    telephone: string;

    @Column()
    @IsEmail()
    email: string;

    @Column()
    address: string;

    @Column()
    shareholders: string;

    @Column({
        nullable: true
    })
    @ValidateIf((o: Organization) => !o.companyNumber)
    @IsNotEmpty()
    ceoPassportNumber: string;

    @Column()
    ceoName: string;

    @Column({
        nullable: true
    })
    @ValidateIf((o: Organization) => !o.ceoPassportNumber)
    @IsNotEmpty()
    companyNumber: string;

    @Column()
    vatNumber: string;

    @Column()
    postcode: string;

    @Column()
    @IsInt()
    @Min(0)
    headquartersCountry: number;

    @Column()
    @IsInt()
    @Min(0)
    country: number;

    @Column()
    businessTypeSelect: string;

    @Column({
        nullable: true
    })
    businessTypeInput: string;

    @Column()
    @IsInt()
    @Min(1900)
    yearOfRegistration: number;

    @Column()
    @IsInt()
    @Min(0)
    numberOfEmployees: number;

    @Column()
    @IsUrl()
    website: string;
}
