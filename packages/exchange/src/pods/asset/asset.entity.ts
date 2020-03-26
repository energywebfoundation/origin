import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Asset extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    address: string;

    @Column()
    tokenId: string;

    @Column()
    deviceId: string;

    @Column({ type: 'timestamptz' })
    generationFrom: Date;

    @Column({ type: 'timestamptz' })
    generationTo: Date;
}
