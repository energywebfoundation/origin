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
import { IEmailServiceProvider } from '../services/email.service';
import { IEventListener } from './IEventListener';
import {
    IOriginEventsStore,
    IPartiallyFilledDemand,
    ICertificateMatchesDemand
} from '../stores/OriginEventsStore';

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

            this.originEventsStore.registerNewIssuedCertificates(newCertificate.owner);
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

            const demandsMatchCertificate: Demand.Entity[] = demands.filter(async demand => {
                const { result } = await new MatchableDemand(demand).matchesCertificate(
                    publishedCertificate,
                    producingAsset
                );
                return result;
            });

            for (const demand of demandsMatchCertificate) {
                this.originEventsStore.registerNewMatchingCertificates(
                    demand,
                    publishedCertificate.id
                );

                this.conf.logger.info(`New certificate found for demand ${demand.id}`);
            }
        });

        marketContractEventHandler.onEvent('DemandPartiallyFilled', async (event: any) => {
            const { _demandId, _entityId, _amount } = event.returnValues;

            const demand = await new Demand.Entity(_demandId, this.conf).sync();

            this.originEventsStore.registerNewPartiallyFilledDemand(demand.demandOwner, {
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

    private async notify() {
        const allUsers: Promise<User.Entity>[] = this.originEventsStore
            .getAllUsers()
            .map(async userId => new User.Entity(userId, this.conf).sync());
        const notifyUsers: User.Entity[] = (await Promise.all(allUsers)).filter(
            user => user.offChainProperties.notifications
        );

        for (const user of notifyUsers) {
            const emailAddress: string = user.offChainProperties.email;
            const newIssuedCertificates: number = this.originEventsStore.getNewIssuedCertificates(
                user.id
            );
            const newMatchingCertificates: ICertificateMatchesDemand[] = this.originEventsStore.getNewMatchingCertificates(
                user.id
            );
            const newPartiallyFilledDemand: IPartiallyFilledDemand[] = this.originEventsStore.getNewPartiallyFilledDemands(
                user.id
            );

            if (newIssuedCertificates > 0) {
                const url = `${process.env.UI_BASE_URL}/${this.originLookupAddress}/certificates/inbox`;

                await this.sendNotificationEmail(
                    NotificationTypes.CERTS_APPROVED,
                    emailAddress,
                    `Local issuer approved your certificates.<br />There are ${newIssuedCertificates} new certificates in your inbox:<br /><a href="${url}">${url}</a>`,
                    () => this.originEventsStore.resetNewIssuedCertificates(user.id)
                );
            }

            if (newMatchingCertificates.length > 0) {
                let urls = newMatchingCertificates.map(
                    match =>
                        `${process.env.UI_BASE_URL}/${this.originLookupAddress}/certificates/for_demand/${match.demandId}`
                );
                urls = urls.filter((url, index) => urls.indexOf(url) === index); // Remove duplicate urls

                await this.sendNotificationEmail(
                    NotificationTypes.FOUND_MATCHING_SUPPLY,
                    emailAddress,
                    `We found ${
                        newMatchingCertificates.length
                    } certificates matching your demands. Open Origin and check it out:${urls.map(
                        url => `<br /><a href="${url}">${url}</a>`
                    )}`,
                    () => this.originEventsStore.resetNewMatchingCertificates(user.id)
                );
            }

            if (newPartiallyFilledDemand.length > 0) {
                await this.sendNotificationEmail(
                    NotificationTypes.DEMAND_PARTIALLY_FILLED,
                    emailAddress,
                    `Matched the following certificates to your demands:\n${newPartiallyFilledDemand
                        .map(
                            match =>
                                `Matched certificate ${match.certificateId} with amount ${match.amount} Wh to demand ${match.demandId}.`
                        )
                        .join('\n')}`,
                    () => this.originEventsStore.resetNewPartiallyFilledDemands(user.id)
                );
            }
        }
    }

    private async sendNotificationEmail(
        notificationType: NotificationTypes,
        emailAddress: string,
        html: string,
        callback: () => void
    ) {
        this.conf.logger.info(`Sending "${notificationType}" email to ${emailAddress}...`);

        await this.emailService.send(
            {
                to: [emailAddress],
                subject: `[Origin] ${notificationType}`,
                html
            },
            () => {
                callback();
                this.conf.logger.info(`Sent "${notificationType}" email to ${emailAddress}.`);
            }
        );
    }

    public stop(): void {
        clearInterval(this.interval);
        this.manager.stop();

        this.started = false;
    }
}
