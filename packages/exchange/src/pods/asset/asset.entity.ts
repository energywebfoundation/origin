import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';

export interface IAsset {
    id: string;
    address: string;
    tokenId: string;
    deviceId: string;
    generationFrom: Date;
    generationTo: Date;
}

@Entity()
export class Asset extends ExtendedBaseEntity implements IAsset {
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

export type CreateAssetDTO = Omit<IAsset, 'id'>;
