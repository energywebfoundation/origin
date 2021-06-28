import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { IsBoolean, IsInt, IsPositive, IsString, Min } from 'class-validator';
import { CertificateUtils, IClaim, IOwnershipCommitmentProof } from '@energyweb/issuer';
import { BlockchainProperties } from '../blockchain/blockchain-properties.entity';

export const CERTIFICATES_TABLE_NAME = 'issuer_certificate';

@Entity({ name: CERTIFICATES_TABLE_NAME })
export class Certificate extends ExtendedBaseEntity {
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

    /* BLOCKCHAIN SPECIFIC */

    @ManyToOne(() => BlockchainProperties)
    blockchain: BlockchainProperties;

    @Column({ nullable: true })
    @IsString()
    creationBlockHash: string;

    /* PRIVATE CERTIFICATES ONLY */

    @Column('simple-json', { nullable: true })
    latestCommitment: IOwnershipCommitmentProof;

    @Column()
    @IsBoolean()
    issuedPrivately: boolean;
}
