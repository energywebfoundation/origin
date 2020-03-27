import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend';

@Entity()
export class Asset extends ExtendedBaseEntity {
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
