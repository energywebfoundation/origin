import { ethers, Event as BlockchainEvent, BigNumber } from 'ethers';
import { Timestamp } from '@energyweb/utils-general';

import { IBlockchainProperties } from './BlockchainProperties';
import { getEventsFromContract } from '../utils/events';
import { decodeData, encodeData } from './CertificateUtils';

// Maximum number Solidity can handle is (2^256)-1
export const MAX_ENERGY_PER_CERTIFICATE = BigNumber.from(2).pow(256).sub(1);

export interface ICertificationRequestBlockchain {
    id: number;
    deviceId: string;
    owner: string;
    fromTime: number;
    toTime: number;
    created: number;
    approved: boolean;
    revoked: boolean;
    approvedDate?: Date;
    revokedDate?: Date;
    issuedCertificateTokenId?: number;
}

export class CertificationRequest implements ICertificationRequestBlockchain {
    public owner: string;

    public fromTime: Timestamp;

    public toTime: Timestamp;

    public deviceId: string;

    public approved: boolean;

    public approvedDate: Date;

    public revoked: boolean;

    public revokedDate: Date;

    public created: Timestamp;

    public issuedCertificateTokenId: number;

    public initialized = false;

    constructor(public id: number, public blockchainProperties: IBlockchainProperties) {}

    public static async create(
        generationStartTime: Timestamp,
        generationEndTime: Timestamp,
        deviceId: string,
        blockchainProperties: IBlockchainProperties,
        forAddress?: string
    ): Promise<CertificationRequest> {
        const newCertificationRequest = new CertificationRequest(null, blockchainProperties);

        const { issuer, activeUser } = blockchainProperties;
        const issuerWithSigner = issuer.connect(activeUser);

        const data = encodeData({ generationStartTime, generationEndTime, deviceId, metadata: '' });

        const tx = await (forAddress
            ? issuerWithSigner.requestCertificationFor(data, forAddress)
            : issuerWithSigner.requestCertification(data));

        const {
            events: [certificationRequested]
        } = await tx.wait();

        const log = issuer.interface.decodeEventLog(
            certificationRequested.event,
            certificationRequested.data,
            certificationRequested.topics
        );

        newCertificationRequest.id = log._id.toNumber();

        return newCertificationRequest.sync();
    }

    public static async getAll(
        blockchainProperties: IBlockchainProperties
    ): Promise<CertificationRequest[]> {
        const { issuer } = blockchainProperties;

        const certificationRequestedEvents = await getEventsFromContract(
            issuer,
            issuer.filters.CertificationRequested(null, null)
        );

        return certificationRequestedEvents.map(
            (event) => new CertificationRequest(event._id, blockchainProperties)
        );
    }

    public async sync(): Promise<CertificationRequest> {
        if (this.id === null) {
            return this;
        }

        const { issuer } = this.blockchainProperties;
        const issueRequest = await issuer.getCertificationRequest(this.id);

        const decodedData = decodeData(issueRequest.data);

        this.owner = issueRequest.owner;
        this.fromTime = decodedData.generationStartTime;
        this.toTime = decodedData.generationEndTime;
        this.deviceId = decodedData.deviceId;
        this.approved = issueRequest.approved;
        this.revoked = issueRequest.revoked;

        const certificationRequestedLogs = await getEventsFromContract(
            issuer,
            issuer.filters.CertificationRequested(null, this.id)
        );

        const certificationApprovedLogs = await getEventsFromContract(
            issuer,
            issuer.filters.CertificationRequestApproved(null, this.id, null)
        );

        this.issuedCertificateTokenId =
            certificationApprovedLogs[0]?._certificateId.toNumber() ?? null;

        const creationBlock = await issuer.provider.getBlock(
            certificationRequestedLogs[0].blockNumber
        );

        this.created = Number(creationBlock.timestamp);

        this.initialized = true;

        return this;
    }

    async approve(energy: BigNumber): Promise<CertificationRequest['issuedCertificateTokenId']> {
        const { issuer, activeUser } = this.blockchainProperties;

        const validityData = issuer.interface.encodeFunctionData('isRequestValid', [
            this.id.toString()
        ]);

        const issuerWithSigner = issuer.connect(activeUser);

        const approveTx = await issuerWithSigner.approveCertificationRequest(
            this.id,
            energy,
            validityData
        );

        const { events } = await approveTx.wait();

        const certificateId = Number(
            events.find((log: BlockchainEvent) => log.event === 'CertificationRequestApproved')
                .topics[3]
        );

        this.issuedCertificateTokenId = certificateId;

        return certificateId;
    }

    async revoke(): Promise<ethers.ContractTransaction> {
        const { issuer, activeUser } = this.blockchainProperties;
        const issuerWithSigner = issuer.connect(activeUser);

        const revokeTx = await issuerWithSigner.revokeRequest(this.id);
        await revokeTx.wait();

        return revokeTx;
    }
}
