import {
    Event as BlockchainEvent,
    ContractTransaction,
    ethers,
    BigNumber,
    utils,
    providers
} from 'ethers';

import { Timestamp } from '@energyweb/utils-general';

import { getEventsFromContract } from '../utils/events';
import {
    encodeClaimData,
    decodeClaimData,
    IShareInCertificate,
    calculateOwnership,
    calculateClaims,
    decodeData,
    encodeData
} from './CertificateUtils';
import { IBlockchainProperties } from './BlockchainProperties';
import { MAX_ENERGY_PER_CERTIFICATE } from './CertificationRequest';
import {
    IOwnershipCommitment,
    IOwnershipCommitmentProofWithTx,
    PreciseProofUtils
} from '../utils/PreciseProofUtils';

export interface IClaimData {
    beneficiary?: string;
    address?: string;
    region?: string;
    zipCode?: string;
    countryCode?: string;
    fromDate?: string;
    toDate?: string;
}

export interface IData {
    deviceId: string;
    generationStartTime: Timestamp;
    generationEndTime: Timestamp;
    metadata: string;
}

export interface IClaim {
    id: number;
    from: string;
    to: string;
    topic: string; // BigNumber string
    value: string; // BigNumber string
    claimData: IClaimData;
}

export interface ICertificate extends IData {
    id: number;
    issuer: string;
    creationTime: Timestamp;
    creationBlockHash: string;
    owners: IShareInCertificate;
    claimers: IShareInCertificate;
}

export class Certificate implements ICertificate {
    public deviceId: string;

    public generationStartTime: Timestamp;

    public generationEndTime: Timestamp;

    public issuer: string;

    public creationTime: Timestamp;

    public creationBlockHash: string;

    public initialized = false;

    public metadata: string;

    public owners: IShareInCertificate;

    public claimers: IShareInCertificate;

    constructor(public id: number, public blockchainProperties: IBlockchainProperties) {}

    public static async create(
        to: string,
        value: BigNumber,
        generationStartTime: Timestamp,
        generationEndTime: Timestamp,
        deviceId: string,
        blockchainProperties: IBlockchainProperties,
        metadata?: string
    ): Promise<Certificate> {
        if (value.gt(MAX_ENERGY_PER_CERTIFICATE)) {
            throw new Error(
                `Too much energy requested. Requested: ${value}, Max: ${MAX_ENERGY_PER_CERTIFICATE}`
            );
        }

        const newCertificate = new Certificate(null, blockchainProperties);

        const getIdFromEvents = (logs: BlockchainEvent[]): number =>
            Number(logs.find((log) => log.event === 'CertificationRequestApproved').topics[2]);

        const { issuer } = blockchainProperties;
        const issuerWithSigner = issuer.connect(blockchainProperties.activeUser);

        const data = encodeData({
            generationStartTime,
            generationEndTime,
            deviceId,
            metadata: metadata ?? ''
        });

        const properChecksumToAddress = ethers.utils.getAddress(to);

        const tx = await issuerWithSigner.issue(properChecksumToAddress, value, data);
        const { events } = await tx.wait();

        newCertificate.id = getIdFromEvents(events);

        return newCertificate.sync();
    }

    public static async createPrivate(
        to: string,
        value: BigNumber,
        generationStartTime: Timestamp,
        generationEndTime: Timestamp,
        deviceId: string,
        blockchainProperties: IBlockchainProperties,
        metadata?: string
    ): Promise<{ certificate: Certificate; proof: IOwnershipCommitmentProofWithTx }> {
        if (value.gt(MAX_ENERGY_PER_CERTIFICATE)) {
            throw new Error(
                `Too much energy requested. Requested: ${value}, Max: ${MAX_ENERGY_PER_CERTIFICATE}`
            );
        }

        const newCertificate = new Certificate(null, blockchainProperties);

        const getIdFromEvents = (logs: BlockchainEvent[]): number =>
            Number(
                logs.find((log) => log.event === 'PrivateCertificationRequestApproved').topics[2]
            );

        const { privateIssuer } = blockchainProperties;
        const privateIssuerWithSigner = privateIssuer.connect(blockchainProperties.activeUser);

        const data = encodeData({
            generationStartTime,
            generationEndTime,
            deviceId,
            metadata: metadata ?? ''
        });

        const properChecksumToAddress = ethers.utils.getAddress(to);

        const ownershipCommitment: IOwnershipCommitment = {
            [properChecksumToAddress]: value.toString()
        };

        const commitmentProof = PreciseProofUtils.generateProofs(ownershipCommitment);

        const tx = await privateIssuerWithSigner.issuePrivate(
            properChecksumToAddress,
            commitmentProof.rootHash,
            data
        );
        const { events } = await tx.wait();

        newCertificate.id = getIdFromEvents(events);

        return {
            certificate: await newCertificate.sync(),
            proof: {
                ...commitmentProof,
                txHash: tx.hash
            }
        };
    }

    async sync(): Promise<Certificate> {
        if (this.id === null) {
            return this;
        }

        const { registry } = this.blockchainProperties;
        const certOnChain = await registry.getCertificate(this.id);

        const decodedData = decodeData(certOnChain.data);

        const issuanceBlock = await this.getIssuanceBlock();
        this.generationStartTime = decodedData.generationStartTime;
        this.generationEndTime = decodedData.generationEndTime;
        this.deviceId = decodedData.deviceId;
        this.metadata = decodedData.metadata;

        this.issuer = certOnChain.issuer;
        this.creationTime = Number(issuanceBlock.timestamp);
        this.creationBlockHash = issuanceBlock.hash;

        this.owners = await calculateOwnership(this.id, this.blockchainProperties);
        this.claimers = await calculateClaims(this.id, this.blockchainProperties);

        this.initialized = true;

        return this;
    }

    async claim(
        claimData: IClaimData,
        amount?: BigNumber,
        to?: string,
        from?: string
    ): Promise<ContractTransaction> {
        const { activeUser, registry } = this.blockchainProperties;
        const registryWithSigner = registry.connect(activeUser);

        const activeUserAddress = await activeUser.getAddress();

        const claimAddress = to ?? activeUserAddress;
        const ownedVolume = BigNumber.from(this.owners[claimAddress] ?? 0);

        if (ownedVolume.eq(0) && !amount) {
            throw new Error(`claim(): ${claimAddress} does not own a share in the certificate.`);
        }

        const fromAddress = from ?? activeUserAddress;

        const encodedClaimData = encodeClaimData(claimData);

        return registryWithSigner.safeTransferAndClaimFrom(
            fromAddress,
            claimAddress,
            this.id,
            amount ?? ownedVolume,
            encodedClaimData, // TO-DO: Check the difference between data and claimData
            encodedClaimData
        );
    }

    async transfer(to: string, amount?: BigNumber, from?: string): Promise<ContractTransaction> {
        if (await this.isRevoked()) {
            throw new Error(`Unable to transfer Certificate #${this.id}. It has been revoked.`);
        }

        const { activeUser, registry } = this.blockchainProperties;
        const fromAddress = from ?? (await activeUser.getAddress());
        const toAddress = ethers.utils.getAddress(to);

        const ownedVolume = BigNumber.from(this.owners[toAddress] ?? 0);

        const registryWithSigner = registry.connect(activeUser);

        return registryWithSigner.safeTransferFrom(
            fromAddress,
            toAddress,
            this.id,
            amount ?? ownedVolume,
            utils.defaultAbiCoder.encode([], []) // TO-DO: Store more meaningful transfer data?
        );
    }

    async mint(to: string, volume: BigNumber): Promise<ContractTransaction> {
        const toAddress = ethers.utils.getAddress(to);

        const { issuer } = this.blockchainProperties;
        const issuerWithSigner = issuer.connect(this.blockchainProperties.activeUser);

        return issuerWithSigner.mint(toAddress, this.id, volume);
    }

    async revoke(): Promise<ContractTransaction> {
        const { issuer } = this.blockchainProperties;
        const issuerWithSigner = issuer.connect(this.blockchainProperties.activeUser);

        return issuerWithSigner.revokeCertificate(this.id);
    }

    async isRevoked(): Promise<boolean> {
        const { issuer } = this.blockchainProperties;

        const revokedEvents = await getEventsFromContract(
            issuer,
            issuer.filters.CertificateRevoked(this.id)
        );

        return revokedEvents.length > 0;
    }

    async getClaimedData(): Promise<IClaim[]> {
        const { registry } = this.blockchainProperties;

        const claims: IClaim[] = [];

        const claimSingleEvents = await getEventsFromContract(
            registry,
            registry.filters.ClaimSingle(null, null, null, null, null, null)
        );

        for (const claimEvent of claimSingleEvents) {
            if (claimEvent._id.toNumber() === this.id) {
                const { _claimData, _id, _claimIssuer, _claimSubject, _topic, _value } = claimEvent;
                const claimData = decodeClaimData(_claimData);

                claims.push({
                    id: _id.toNumber(),
                    from: _claimIssuer,
                    to: _claimSubject,
                    topic: _topic.toString(),
                    value: _value.toString(),
                    claimData
                });
            }
        }

        const claimBatchEvents = await getEventsFromContract(
            registry,
            registry.filters.ClaimBatch(null, null, null, null, null, null)
        );

        for (const claimBatchEvent of claimBatchEvents) {
            if (
                claimBatchEvent._ids.map((idAsBN: BigNumber) => idAsBN.toNumber()).includes(this.id)
            ) {
                const { _ids, _claimData, _claimIssuer, _claimSubject, _topics, _values } =
                    claimBatchEvent;
                const claimIds = _ids.map((idAsBN: BigNumber) => idAsBN.toNumber());

                const index = claimIds.indexOf(this.id);
                const claimData = decodeClaimData(_claimData[index]);

                claims.push({
                    id: _ids[index].toNumber(),
                    from: _claimIssuer,
                    to: _claimSubject,
                    topic: _topics[index]?.toString(),
                    value: _values[index].toString(),
                    claimData
                });
            }
        }

        return claims;
    }

    private async getIssuanceBlock(): Promise<providers.Block> {
        const { registry } = this.blockchainProperties;

        const allIssuanceLogs = await getEventsFromContract(
            registry,
            registry.filters.IssuanceSingle(null, null, null)
        );

        let issuanceLog = allIssuanceLogs.find(
            (event) => event._id.toString() === this.id.toString()
        );

        if (!issuanceLog) {
            const allBatchIssuanceLogs = await getEventsFromContract(
                registry,
                registry.filters.IssuanceBatch(null, null, null, null)
            );

            issuanceLog = allBatchIssuanceLogs.find((event) =>
                event._ids.map((id: BigNumber) => id.toString()).includes(this.id.toString())
            );
        }

        return registry.provider.getBlock(issuanceLog.blockHash);
    }
}
