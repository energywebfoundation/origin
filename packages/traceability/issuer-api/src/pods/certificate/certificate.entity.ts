import {
    Column,
    Entity,
    ManyToOne,
    PrimaryColumn,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';
import { IsBoolean, IsInt, IsPositive, IsString, Min, IsNumber } from 'class-validator';
import {
    CertificateSchemaVersion,
    CertificateUtils,
    IClaim,
    IOwnershipCommitmentProof
} from '@energyweb/issuer';
import { BlockchainProperties } from '../blockchain/blockchain-properties.entity';

export const CERTIFICATES_TABLE_NAME = 'issuer_certificate';

@Entity({ name: CERTIFICATES_TABLE_NAME })
export class Certificate {
    @PrimaryColumn()
    @IsInt()
    @Min(1)
    id: number;

    @Column()
    @IsString()
    deviceId: string;

    @Column()
    @IsInt()
    @IsPositive()
    generationStartTime: number;

    @Column()
    @IsInt()
    @IsPositive()
    generationEndTime: number;

    @Column()
    @IsInt()
    @IsPositive()
    creationTime: number;

    @Column({ default: '' })
    metadata: string;

    @Column('simple-json')
    owners: CertificateUtils.IShareInCertificate;

    @Column('simple-json', { nullable: true })
    claimers: CertificateUtils.IShareInCertificate;

    @Column('simple-json', { nullable: true })
    claims: IClaim[];

    @ManyToOne(() => BlockchainProperties)
    blockchain: BlockchainProperties;

    @Column()
    @IsString()
    creationTransactionHash: string;

    @Column('simple-json', { nullable: true })
    /* PRIVATE CERTIFICATES ONLY */
    latestCommitment: IOwnershipCommitmentProof;

    @Column()
    @IsBoolean()
    issuedPrivately: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @Column()
    @IsNumber({ maxDecimalPlaces: 0 })
    @IsPositive()
    schemaVersion: CertificateSchemaVersion;
}
