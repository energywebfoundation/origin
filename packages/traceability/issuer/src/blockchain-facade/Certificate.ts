import { ContractTransaction, ethers, BigNumber, utils, providers } from 'ethers';

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
    IOwnershipCommitmentProof,
    PreciseProofUtils
} from '../utils/PreciseProofUtils';

// When this get changed, please go through all usage cases
// and make sure all versions are handled correctly
export enum CertificateSchemaVersion {
    /** Original version */
    V1 = 1,
    /** ClaimData is now serializable JSON generic */
    V2 = 2,
    Latest = 2
}

export type IClaimData = {
    // This interface aims to be backward compatible with schema version 1, but make it more generic
    // It needs to be seriazible to JSON
    [key: string]:
        | null
        | string
        | number
        | IClaimData
        | null[]
        | string[]
        | number[]
        | IClaimData[];
};

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
    creationTransactionHash: string;
    owners: IShareInCertificate;
    claimers: IShareInCertificate;
    schemaVersion: CertificateSchemaVersion;
}

export interface ICertificateSyncParams {
    creationTransactionHash?: string;
}

export class Certificate implements ICertificate {
    public deviceId: string;

    public generationStartTime: Timestamp;

    public generationEndTime: Timestamp;

    public issuer: string;

    public creationTime: Timestamp;

    public creationTransactionHash: string;

    public initialized = false;

    public metadata: string;

    public owners: IShareInCertificate;

    public claimers: IShareInCertificate;

    constructor(
        public id: number,
        public blockchainProperties: IBlockchainProperties,
        public schemaVersion: CertificateSchemaVersion
    ) {}

    /**
     *
     *
     * @description Uses the Issuer contract to allow direct issuance of a certificate
     *
     */
    public static async create(
        to: string,
        value: BigNumber,
        generationStartTime: Timestamp,
        generationEndTime: Timestamp,
        deviceId: string,
        blockchainProperties: IBlockchainProperties,
        metadata?: string
    ): Promise<ContractTransaction> {
        if (value.gt(MAX_ENERGY_PER_CERTIFICATE)) {
            throw new Error(
                `Too much energy requested. Requested: ${value}, Max: ${MAX_ENERGY_PER_CERTIFICATE}`
            );
        }

        const { issuer } = blockchainProperties;
        const issuerWithSigner = issuer.connect(blockchainProperties.activeUser);

        const data = encodeData({
            generationStartTime,
            generationEndTime,
            deviceId,
            metadata: metadata ?? ''
        });

        const properChecksumToAddress = ethers.utils.getAddress(to);

        return await issuerWithSigner.issue(properChecksumToAddress, value, data);
    }

    /**
     *
     *
     * @description Returns the Certificate that was created in a given transaction
     *
     */
    public static async fromTxHash(
        txHash: string,
        blockchainProperties: IBlockchainProperties,
        schemaVersion: CertificateSchemaVersion
    ): Promise<Certificate> {
        const tx = await blockchainProperties.web3.getTransactionReceipt(txHash);

        if (!tx || !tx.blockNumber) {
            throw new Error(`No certificate was issued in transaction ${txHash}`);
        }

        let result: ethers.utils.Result;

        for (const log of tx.logs) {
            try {
                result = blockchainProperties.issuer.interface.decodeEventLog(
                    'CertificationRequestApproved',
                    log.data,
                    log.topics
                );
            } catch (e) {
                continue;
            }

            try {
                result = blockchainProperties.issuer.interface.decodeEventLog(
                    'PrivateCertificationRequestApproved',
                    log.data,
                    log.topics
                );
            } catch (e) {
                continue;
            }
        }

        const newCertificate = new Certificate(
            result._id.toNumber(),
            blockchainProperties,
            schemaVersion
        );

        return newCertificate.sync({
            creationTransactionHash: txHash
        });
    }

    /**
     *
     *
     * @description Uses Private Issuer contract to allow issuance of a private Certificate
     *
     */
    public static async createPrivate(
        to: string,
        value: BigNumber,
        generationStartTime: Timestamp,
        generationEndTime: Timestamp,
        deviceId: string,
        blockchainProperties: IBlockchainProperties,
        metadata?: string
    ): Promise<{ proof: IOwnershipCommitmentProof; tx: ContractTransaction }> {
        if (value.gt(MAX_ENERGY_PER_CERTIFICATE)) {
            throw new Error(
                `Too much energy requested. Requested: ${value}, Max: ${MAX_ENERGY_PER_CERTIFICATE}`
            );
        }

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

        return {
            proof: commitmentProof,
            tx
        };
    }

    /**
     *
     *
     * @description Retrieves current data for a Certificate
     *
     */
    async sync(params: ICertificateSyncParams = {}): Promise<Certificate> {
        if (this.id === null) {
            return this;
        }

        const { registry } = this.blockchainProperties;

        if (params.creationTransactionHash) {
            // This will speed up getIssuanceTransaction required for starting block
            this.creationTransactionHash = params.creationTransactionHash;
        }

        const issuanceTransaction = await this.getIssuanceTransaction();

        const certOnChain = await registry.getCertificate(this.id);

        const decodedData = decodeData(certOnChain.data);

        this.generationStartTime = decodedData.generationStartTime;
        this.generationEndTime = decodedData.generationEndTime;
        this.deviceId = decodedData.deviceId;
        this.metadata = decodedData.metadata;

        this.issuer = certOnChain.issuer;

        const creationBlock = await registry.provider.getBlock(issuanceTransaction.blockNumber);
        this.creationTime = Number(creationBlock.timestamp);
        this.creationTransactionHash = issuanceTransaction.transactionHash;

        this.owners = await calculateOwnership(
            this.id,
            this.blockchainProperties,
            issuanceTransaction.blockNumber
        );
        this.claimers = await calculateClaims(
            this.id,
            this.blockchainProperties,
            issuanceTransaction.blockNumber
        );

        this.initialized = true;

        return this;
    }

    /**
     *
     *
     * @description Uses Registry contract to allow user to claim all or part of a Certificate's volume units
     *
     */
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

        const encodedClaimData = encodeClaimData(this.schemaVersion, claimData);
        return registryWithSigner.safeTransferAndClaimFrom(
            fromAddress,
            claimAddress,
            this.id,
            amount ?? ownedVolume,
            encodedClaimData, // TO-DO: Check the difference between data and claimData
            encodedClaimData
        );
    }

    /**
     *
     *
     * @description Uses Registry contract to allow user to transfer part or all of a Certificate's volume units to another address
     *
     */
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
    /**
     *
     *
     * @description Uses Issuer contract to allow issuer to mint more volumes of energy units for an existing Certificate
     *
     */
    async mint(to: string, volume: BigNumber): Promise<ContractTransaction> {
        const toAddress = ethers.utils.getAddress(to);

        const { issuer } = this.blockchainProperties;
        const issuerWithSigner = issuer.connect(this.blockchainProperties.activeUser);

        return issuerWithSigner.mint(toAddress, this.id, volume);
    }

    /**
     *
     *
     * @description Uses Issuer contract to allow issuer to revoke a Certificate
     *
     */
    async revoke(): Promise<ContractTransaction> {
        const { issuer } = this.blockchainProperties;
        const issuerWithSigner = issuer.connect(this.blockchainProperties.activeUser);

        return issuerWithSigner.revokeCertificate(this.id);
    }

    /**
     *
     *
     * @description Allows issuer to see if Certificate has been revoked
     * @returns boolean
     */
    async isRevoked(): Promise<boolean> {
        const { issuer } = this.blockchainProperties;

        const issuanceTransaction = await this.getIssuanceTransaction();

        const revokedEvents = await getEventsFromContract(
            issuer,
            issuer.filters.CertificateRevoked(this.id),
            issuanceTransaction.blockNumber
        );

        return revokedEvents.length > 0;
    }

    /**
     *
     *
     * @description Returns all claim data for a Certificate
     *
     */
    async getClaimedData(): Promise<IClaim[]> {
        const { registry } = this.blockchainProperties;

        const issuanceTransaction = await this.getIssuanceTransaction();

        const claims: IClaim[] = [];

        const claimSingleEvents = await getEventsFromContract(
            registry,
            registry.filters.ClaimSingle(null, null, null, null, null, null),
            issuanceTransaction.blockNumber
        );

        for (const claimEvent of claimSingleEvents) {
            if (claimEvent._id.toNumber() === this.id) {
                const { _claimData, _id, _claimIssuer, _claimSubject, _topic, _value } = claimEvent;
                const claimData = decodeClaimData(this.schemaVersion, _claimData);

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
            registry.filters.ClaimBatch(null, null, null, null, null, null),
            issuanceTransaction.blockNumber
        );

        for (const claimBatchEvent of claimBatchEvents) {
            if (
                claimBatchEvent._ids.map((idAsBN: BigNumber) => idAsBN.toNumber()).includes(this.id)
            ) {
                const { _ids, _claimData, _claimIssuer, _claimSubject, _topics, _values } =
                    claimBatchEvent;
                const claimIds = _ids.map((idAsBN: BigNumber) => idAsBN.toNumber());

                const index = claimIds.indexOf(this.id);
                const claimData = decodeClaimData(this.schemaVersion, _claimData[index]);

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

        const claimBatchMultipleEvents = await getEventsFromContract(
            registry,
            registry.filters.ClaimBatchMultiple(null, null, null, null, null, null),
            issuanceTransaction.blockNumber
        );

        for (const claimBatchMultipleEvent of claimBatchMultipleEvents) {
            if (
                claimBatchMultipleEvent._ids
                    .map((idAsBN: BigNumber) => idAsBN.toNumber())
                    .includes(this.id)
            ) {
                const { _ids, _claimData, _claimIssuer, _claimSubject, _topics, _values } =
                    claimBatchMultipleEvent;
                const claimIds = _ids.map((idAsBN: BigNumber) => idAsBN.toNumber());

                const index = claimIds.indexOf(this.id);

                claims.push({
                    id: _ids[index].toNumber(),
                    from: _claimIssuer[index],
                    to: _claimSubject[index],
                    topic: _topics[index]?.toString(),
                    value: _values[index].toString(),
                    claimData: decodeClaimData(this.schemaVersion, _claimData[index])
                });
            }
        }

        return claims;
    }

    /**
     *
     *
     * @description Returns the Issuance transaction for a Certificate
     *
     */
    private async getIssuanceTransaction(): Promise<providers.TransactionReceipt> {
        const { registry } = this.blockchainProperties;

        if (this.creationTransactionHash) {
            return await registry.provider.getTransactionReceipt(this.creationTransactionHash);
        }

        const allBatchIssuanceLogs = await getEventsFromContract(
            registry,
            registry.filters.IssuanceBatch(null, null, null, null)
        );

        let issuanceLog = allBatchIssuanceLogs.find((event) =>
            event._ids.map((id: BigNumber) => id.toString()).includes(this.id.toString())
        );

        if (!issuanceLog) {
            const allIssuanceLogs = await getEventsFromContract(
                registry,
                registry.filters.IssuanceSingle(null, null, null)
            );

            issuanceLog = allIssuanceLogs.find(
                (event) => event._id.toString() === this.id.toString()
            );

            if (!issuanceLog) {
                throw new Error(`Unable to find the issuance event for Certificate ${this.id}`);
            }
        }

        return registry.provider.getTransactionReceipt(issuanceLog.transactionHash);
    }
}
