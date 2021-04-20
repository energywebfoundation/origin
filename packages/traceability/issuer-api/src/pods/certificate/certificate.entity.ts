import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, Unique, getRepository } from 'typeorm';
import { IsBoolean, IsInt, IsPositive, IsString, Min } from 'class-validator';
import {
    CertificateUtils,
    IClaim,
    IOwnershipCommitmentProof,
    Certificate as OnChainCertificate
} from '@energyweb/issuer';
import { BlockchainProperties } from '../blockchain/blockchain-properties.entity';
import { ISuccessResponse, ResponseFailure, ResponseSuccess } from '@energyweb/origin-backend-core';

export const CERTIFICATES_TABLE_NAME = 'issuer_certificate';

@Entity({ name: CERTIFICATES_TABLE_NAME })
@Unique(['tokenId'])
export class Certificate extends ExtendedBaseEntity {
    @PrimaryGeneratedColumn()
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
    @IsInt()
    @Min(0)
    tokenId: number;

    @Column({ nullable: true })
    @IsString()
    creationBlockHash: string;

    /* PRIVATE CERTIFICATES ONLY */

    @Column('simple-json', { nullable: true })
    latestCommitment: IOwnershipCommitmentProof;

    @Column()
    @IsBoolean()
    issuedPrivately: boolean;

    /*
        Syncs the db certificate with it's on-chain counterpart.
    */
    async sync(): Promise<ISuccessResponse> {
        if (!this.blockchain || !this.tokenId) {
            throw new Error(
                `Certificate ${this.id} is missing either blockchain (${this.blockchain}) or tokenId (${this.tokenId}) properties.`
            );
        }

        const onChainCert = await new OnChainCertificate(
            this.tokenId,
            this.blockchain.wrap()
        ).sync();

        const certificateRepository = getRepository(Certificate);

        const updateResult = await certificateRepository.update(this.id, {
            owners: onChainCert.owners,
            claimers: onChainCert.claimers,
            claims: await onChainCert.getClaimedData()
        });

        if (updateResult.affected < 1) {
            return ResponseFailure(
                `Unable to perform update on certificate ${this.id}: ${updateResult.raw}`,
                500
            );
        }

        return ResponseSuccess();
    }
}
