import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: `exchange_exported` })
export class ExportedAsset extends ExtendedBaseEntity {
    @ApiProperty({ type: String })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ type: String })
    @Column()
    assetId: string;

    @ApiProperty({ type: String })
    @Column()
    ownerId: string;

    @ApiProperty({ type: String })
    @Column('bigint')
    amount: string;

    @ApiProperty({ type: String })
    @Column()
    irecAssetId: string;
}
