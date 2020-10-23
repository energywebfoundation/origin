import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { IsBoolean, IsInt } from 'class-validator';
import {
    CertificateUtils,
    IClaim,
    IOwnershipCommitmentProof,
    Certificate as OnChainCertificate
} from '@energyweb/issuer';
import { BadRequestException } from '@nestjs/common';
import { BlockchainProperties } from '../blockchain/blockchain-properties.entity';

export const CERTIFICATES_TABLE_NAME = 'issuer_certificate';

@Entity({ name: CERTIFICATES_TABLE_NAME })
@Unique(['tokenId'])
export class Certificate extends ExtendedBaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => BlockchainProperties)
    blockchain: BlockchainProperties;

    @Column()
    tokenId: number;

    @Column()
    deviceId: string;

    @Column()
    @IsInt()
    generationStartTime: number;

    @Column()
    @IsInt()
    generationEndTime: number;

    @Column()
    @IsInt()
    creationTime: number;

    @Column()
    creationBlockHash: string;

    @Column('simple-json')
    owners: CertificateUtils.IShareInCertificate;

    @Column('simple-json', { nullable: true })
    claimers: CertificateUtils.IShareInCertificate;

    @Column('simple-json', { nullable: true })
    claims: IClaim[];

    /* PRIVATE CERTIFICATES ONLY */

    @Column('simple-json', { nullable: true })
    latestCommitment: IOwnershipCommitmentProof;

    @Column()
    @IsBoolean()
    issuedPrivately: boolean;

    /*
        Syncs the db certificate with it's on-chain counterpart.
    */
    async sync(): Promise<void> {
        if (!this.blockchain || !this.tokenId) {
            throw new BadRequestException({
                success: false,
                message: `Certificate ${this.id} doesn't have blockchain properties attached.`
            });
        }

        const onChainCert = await new OnChainCertificate(
            this.tokenId,
            this.blockchain.wrap()
        ).sync();

        await Certificate.update(this.id, {
            owners: onChainCert.owners,
            claimers: onChainCert.claimers,
            claims: await onChainCert.getClaimedData()
        });
    }
}
