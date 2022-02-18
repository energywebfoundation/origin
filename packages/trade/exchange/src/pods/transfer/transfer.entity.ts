import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { IClaimData } from '../transfer/dto/claim-data.dto';
import { Asset } from '../asset';
import { ClaimDataDTO } from './dto';
import { DB_TABLE_PREFIX } from '../../utils';
import { TransferDirection } from './transfer-direction';
import { TransferStatus } from './transfer-status';

@Entity({ name: `${DB_TABLE_PREFIX}_transfer` })
@Unique(['direction', 'transactionHash'])
export class Transfer extends ExtendedBaseEntity {
    @ApiProperty({
        type: String,
        description: 'UUID string identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ type: String })
    @Column()
    userId: string;

    @ApiProperty({ type: () => Asset })
    @ManyToOne(() => Asset, { eager: true })
    asset: Asset;

    @ApiProperty({ type: String, example: '500' })
    @Column('bigint')
    amount: string;

    @ApiProperty({ type: String })
    @Column({ nullable: true })
    transactionHash: string;

    @ApiProperty({
        type: String,
        description: 'Public blockchain address',
        example: '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8'
    })
    @Column()
    address: string;

    @ApiProperty({ enum: TransferStatus, enumName: 'TransferStatus' })
    @Column()
    status: TransferStatus;

    @ApiProperty({ type: Number })
    @Column({ nullable: true })
    confirmationBlock?: number;

    @ApiProperty({ enum: TransferDirection, enumName: 'TransferDirection' })
    @Column()
    direction: TransferDirection;

    @ApiProperty({ type: ClaimDataDTO, nullable: true, required: false })
    @Column('simple-json', { nullable: true })
    @IsOptional()
    claimData?: IClaimData;

    @ApiProperty({ type: String, nullable: true, required: false })
    @Column({ nullable: true })
    @IsOptional()
    claimAddress?: string;
}
