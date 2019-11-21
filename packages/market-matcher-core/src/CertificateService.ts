import { Demand, PurchasableCertificate } from '@energyweb/market';
import { Configuration, Unit } from '@energyweb/utils-general';
import * as Winston from 'winston';
import { TransactionReceipt } from 'web3-core'; // eslint-disable-line import/no-unresolved

export class CertificateService {
    constructor(private config: Configuration.Entity, private logger: Winston.Logger) {}

    public async executeMatching(
        certificate: PurchasableCertificate.IPurchasableCertificate,
        demand: Demand.IDemand,
        fromAgreement: boolean
    ) {
        this.logger.verbose(
            `[Certificate #${certificate.id}] Executing matching with demand #${demand.id}`
        );

        const { value: requiredEnergy } = await demand.missingEnergyInCurrentPeriod();

        this.logger.verbose(
            `[Certificate #${certificate.id}] Missing energy from demand #${
                demand.id
            } is ${requiredEnergy / Unit.kWh}KWh`
        );

        this.logger.verbose(
            `[Certificate #${certificate.id}] Available energy: ${certificate.certificate.energy /
                Unit.kWh}KWh`
        );

        if (certificate.certificate.energy <= requiredEnergy) {
            return fromAgreement
                ? this.matchDemandFromAgreement(certificate, demand)
                : this.matchDemand(certificate, demand);
        }
        return this.splitCertificate(certificate, requiredEnergy);
    }

    private async splitCertificate(
        certificate: PurchasableCertificate.IPurchasableCertificate,
        requiredEnergy: number
    ): Promise<boolean> {
        this.logger.info(`[Certificate #${certificate.id}] Splitting at ${requiredEnergy}`);

        const splitTx = await certificate.splitCertificate(requiredEnergy);

        return splitTx.status;
    }

    private async matchDemand(
        certificate: PurchasableCertificate.IPurchasableCertificate,
        demand: Demand.IDemand
    ) {
        return this.match(certificate, demand, demand.fill.bind(demand));
    }

    private async matchDemandFromAgreement(
        certificate: PurchasableCertificate.IPurchasableCertificate,
        demand: Demand.IDemand
    ) {
        return this.match(certificate, demand, demand.fillAgreement.bind(demand));
    }

    private async match(
        certificate: PurchasableCertificate.IPurchasableCertificate,
        demand: Demand.IDemand,
        match: (entityId: string) => Promise<TransactionReceipt>
    ) {
        if (
            (await this.isAlreadyTransferred(certificate, demand.demandOwner)) ||
            demand.status !== Demand.DemandStatus.ACTIVE
        ) {
            return false;
        }

        this.logger.verbose(
            `[Certificate #${certificate.id}] Transferring to demand #${demand.id} owned by ${demand.demandOwner} with account ${this.config.blockchainProperties.activeUser.address}`
        );

        try {
            const fillTx = await match(certificate.id);

            return fillTx.status;
        } catch (e) {
            this.logger.error(`[Certificate #${certificate.id}] Transferring failed with ${e}`);
        }

        return false;
    }

    private async isAlreadyTransferred(
        certificate: PurchasableCertificate.IPurchasableCertificate,
        owner: string
    ) {
        const syncedCertificate = await certificate.sync();

        if (certificate.certificate.owner.toLowerCase() === owner.toLowerCase()) {
            this.logger.verbose(
                `[Certificate #${syncedCertificate.id}] Already transferred to request demand owner ${owner}`
            );
            return true;
        }

        return false;
    }
}
