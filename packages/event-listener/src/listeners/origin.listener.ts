import { ProducingAsset } from '@energyweb/asset-registry';
import { Demand } from '@energyweb/market';
import { MatchableDemand } from '@energyweb/market-matcher';
import { Certificate } from '@energyweb/origin';
import { User } from '@energyweb/user-registry';
import { Configuration, ContractEventHandler, EventHandlerManager } from '@energyweb/utils-general';
import Web3 from 'web3';

import { SCAN_INTERVAL } from '..';
import { initOriginConfig } from '../config/origin.config';
import NotificationTypes from '../notification/NotificationTypes';
import { IEmailResponse, IEmailServiceProvider } from '../services/email.service';
import { IEventListener } from './IEventListener';
import { IOriginEventsStore } from '../stores/OriginEventsStore';

export interface IOriginEventListener extends IEventListener {
    originLookupAddress: string;
    emailService: IEmailServiceProvider;
}

export class OriginEventListener implements IOriginEventListener {
    public started: boolean;

    public conf: Configuration.Entity;

    public manager: EventHandlerManager;

    private interval: any;

    constructor(
        public originLookupAddress: string,
        public web3: Web3,
        public emailService: IEmailServiceProvider,
        private originEventsStore: IOriginEventsStore,
        public notificationInterval?: number
    ) {
        this.notificationInterval = notificationInterval || 60000; // Default to 1 min intervals

        this.started = false;
        this.interval = null;
    }

    public async start(): Promise<void> {
        this.conf = await initOriginConfig(this.originLookupAddress, this.web3);

        const currentBlockNumber: number = await this.conf.blockchainProperties.web3.eth.getBlockNumber();
        const certificateContractEventHandler = new ContractEventHandler(
            this.conf.blockchainProperties.certificateLogicInstance,
            currentBlockNumber
        );

        const marketContractEventHandler = new ContractEventHandler(
            this.conf.blockchainProperties.marketLogicInstance,
            currentBlockNumber
        );

        certificateContractEventHandler.onEvent('LogCreatedCertificate', async (event: any) => {
            const certId = event.returnValues._certificateId;
            this.conf.logger.info(`Event: LogCreatedCertificate certificate #${certId}`);

            const newCertificate: Certificate.Entity = await new Certificate.Entity(
                certId,
                this.conf
            ).sync();
            const certOwner: User.Entity = await new User.Entity(newCertificate.owner, this
                .conf as any).sync();

            this.originEventsStore.incrementNewIssuedCertificates(certOwner);

            this.conf.logger.info(
                `<${
                    certOwner.offChainProperties.email
                }> New certificate approved. Buffered emails count: ${this.originEventsStore.getNewIssuedCertificates(
                    certOwner
                )}`
            );
        });

        certificateContractEventHandler.onEvent('LogPublishForSale', async (event: any) => {
            const publishedCertificate = await new Certificate.Entity(
                event.returnValues._entityId,
                this.conf
            ).sync();

            this.conf.logger.info(
                `Event: LogPublishForSale certificate #${
                    publishedCertificate.id
                } at ${JSON.stringify(publishedCertificate.offChainSettlementOptions)}`
            );

            const demands = await Demand.getAllDemands(this.conf);

            const producingAsset = await new ProducingAsset.Entity(
                publishedCertificate.assetId.toString(),
                this.conf
            ).sync();

            const demandsMatchCertificate: Demand.Entity[] = demands.filter(demand => {
                const { result } = new MatchableDemand(demand).matchesCertificate(
                    publishedCertificate,
                    producingAsset
                );
                return result;
            });

            for (const demand of demandsMatchCertificate) {
                const demandOwner = await new User.Entity(demand.demandOwner, this.conf).sync();

                this.originEventsStore.incrementNewMatchingCertificates(demandOwner);

                this.conf.logger.info(
                    `<${
                        demandOwner.offChainProperties.email
                    }> New certificate found for demand. Buffered emails count: ${this.originEventsStore.getNewMatchingCertificates(
                        demandOwner
                    )}`
                );
            }
        });

        marketContractEventHandler.onEvent('DemandPartiallyFilled', async (event: any) => {
            const { _demandId, _entityId, _amount } = event.returnValues;

            const demand = await new Demand.Entity(_demandId, this.conf).sync();
            const demandOwner = await new User.Entity(demand.demandOwner, this.conf).sync();

            this.originEventsStore.addNewPartiallyFilledDemand(demandOwner, {
                demandId: _demandId,
                certificateId: _entityId,
                amount: _amount
            });

            this.conf.logger.info(
                `Event: DemandPartiallyFilled: Matched certificate #${_entityId} with energy ${_amount} to Demand #${_demandId}.`
            );
        });

        this.manager = new EventHandlerManager(SCAN_INTERVAL, this.conf);
        this.manager.registerEventHandler(certificateContractEventHandler);
        this.manager.registerEventHandler(marketContractEventHandler);

        this.manager.start();
        this.interval = setInterval(this.notify.bind(this), this.notificationInterval);

        this.started = true;
        this.conf.logger.info(`Started listener for ${this.originLookupAddress}`);
    }

    public async notify() {
        const allUsers: User.Entity[] = this.originEventsStore.getAllUsers();

        for (const user of allUsers) {
            const emailAddress: string = user.offChainProperties.email;
            const notificationsEnabled: boolean = user.offChainProperties.notifications;

            const newIssuedCertificates: number = this.originEventsStore.getNewIssuedCertificates(
                user
            );

            if (newIssuedCertificates > 0 && notificationsEnabled) {
                this.conf.logger.info(`Sending email to ${emailAddress}...`);

                const response: IEmailResponse = await this.emailService.send({
                    to: [emailAddress],
                    subject: `[Origin] ${NotificationTypes.CERTS_APPROVED}`,
                    html: `
                        Local issuer approved your certificates. 
                        There are ${newIssuedCertificates} new certificates in your inbox:
                        ${process.env.UI_BASE_URL}/${this.originLookupAddress}/certificates/inbox
                    `
                });

                if (!response.success) {
                    this.conf.logger.error(
                        `Unable to send email to ${emailAddress}: ${response.error}`
                    );
                    return;
                }

                this.conf.logger.info('Sent.');

                this.originEventsStore.resetNewIssuedCertificates(user);
            }

            const newMatchingCertificates: number = this.originEventsStore.getNewMatchingCertificates(
                user
            );

            if (newMatchingCertificates > 0 && notificationsEnabled) {
                this.conf.logger.info(`Sending email to ${emailAddress}...`);

                const response: IEmailResponse = await this.emailService.send({
                    to: [emailAddress],
                    subject: `[Origin] ${NotificationTypes.FOUND_MATCHING_SUPPLY}`,
                    html: `
                        We found ${newMatchingCertificates} certificates matching your demand. Open Origin and check it out:
                        ${process.env.UI_BASE_URL}/${this.originLookupAddress}/certificates/for_demand/
                    `
                });

                if (!response.success) {
                    this.conf.logger.error(
                        `Unable to send email to ${emailAddress}: ${response.error}`
                    );
                    return;
                }

                this.conf.logger.info('Sent.');

                this.originEventsStore.resetNewMatchingCertificates(user);
            }
        }
    }

    public stop(): void {
        clearInterval(this.interval);
        this.manager.stop();

        this.started = false;
    }
}
