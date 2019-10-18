import { ProducingAsset } from '@energyweb/asset-registry';
import { Demand } from '@energyweb/market';
import { MatchableDemand } from '@energyweb/market-matcher';
import { Certificate } from '@energyweb/origin';
import { User } from '@energyweb/user-registry';
import { Configuration, ContractEventHandler, EventHandlerManager } from '@energyweb/utils-general';
import Web3 from 'web3';

import { SCAN_INTERVAL } from '..';
import { initOriginConfig } from '../config/origin.config';
import EmailTypes from '../email/EmailTypes';
import { IEmailServiceProvider } from '../services/email.service';
import { IEventListener } from './IEventListener';
import {
    IOriginEventsStore,
    IPartiallyFilledDemand,
    ICertificateMatchesDemand
} from '../stores/OriginEventsStore';

export interface IOriginEventListener extends IEventListener {
    marketLookupAddress: string;
    emailService: IEmailServiceProvider;
}

export class OriginEventListener implements IOriginEventListener {
    public started: boolean;

    public conf: Configuration.Entity;

    public manager: EventHandlerManager;

    private interval: any;

    constructor(
        public marketLookupAddress: string,
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
        this.conf = await initOriginConfig(this.marketLookupAddress, this.web3);

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

            this.originEventsStore.registerIssuedCertificate(newCertificate.owner);
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

            const demandsMatchCertificate: Demand.Entity[] = [];

            for (const demand of demands) {
                const { result } = await new MatchableDemand(demand).matchesCertificate(
                    publishedCertificate,
                    producingAsset
                );
                if (result) {
                    demandsMatchCertificate.push(demand);
                }
            }

            for (const demand of demandsMatchCertificate) {
                this.originEventsStore.registerMatchingCertificate(demand, publishedCertificate.id);

                this.conf.logger.info(`New certificate found for demand ${demand.id}`);
            }
        });

        marketContractEventHandler.onEvent('DemandPartiallyFilled', async (event: any) => {
            const { _demandId, _entityId, _amount } = event.returnValues;

            const demand = await new Demand.Entity(_demandId, this.conf).sync();

            this.originEventsStore.registerPartiallyFilledDemand(demand.demandOwner, {
                demandId: _demandId,
                certificateId: _entityId,
                amount: _amount
            });

            this.conf.logger.info(
                `Event: DemandPartiallyFilled: Matched certificate #${_entityId} with energy ${_amount} to Demand #${_demandId}.`
            );

            if (await demand.isFulfilled()) {
                this.originEventsStore.registerFulfilledDemand(demand.demandOwner, _demandId);

                this.conf.logger.info(`DemandFulfilled: Demand #${_demandId} has been fulfilled.`);
            }
        });

        this.manager = new EventHandlerManager(SCAN_INTERVAL, this.conf);
        this.manager.registerEventHandler(certificateContractEventHandler);
        this.manager.registerEventHandler(marketContractEventHandler);

        this.manager.start();
        this.interval = setInterval(this.notify.bind(this), this.notificationInterval);

        this.started = true;
        this.conf.logger.info(`Started listener for ${this.marketLookupAddress}`);
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
            const issuedCertificates: number = this.originEventsStore.getIssuedCertificates(
                user.id
            );
            const matchingCertificates: ICertificateMatchesDemand[] = this.originEventsStore.getMatchingCertificates(
                user.id
            );
            const partiallyFilledDemands: IPartiallyFilledDemand[] = this.originEventsStore.getPartiallyFilledDemands(
                user.id
            );
            const fulfilledDemands: number[] = this.originEventsStore.getFulfilledDemands(user.id);

            if (issuedCertificates > 0) {
                const url = `${process.env.UI_BASE_URL}/certificates/inbox`;

                await this.sendNotificationEmail(
                    EmailTypes.CERTS_APPROVED,
                    emailAddress,
                    `Local issuer approved your certificates.<br />There are ${issuedCertificates} new certificates in your inbox:<br /><a href="${url}">${url}</a>`,
                    () => this.originEventsStore.resetIssuedCertificates(user.id)
                );
            }

            if (matchingCertificates.length > 0) {
                let urls = matchingCertificates.map(
                    match => `${process.env.UI_BASE_URL}/certificates/for_demand/${match.demandId}`
                );
                urls = urls.filter((url, index) => urls.indexOf(url) === index); // Remove duplicate urls

                await this.sendNotificationEmail(
                    EmailTypes.FOUND_MATCHING_SUPPLY,
                    emailAddress,
                    `We found ${
                        matchingCertificates.length
                    } certificates matching your demands. Open Origin and check it out:${urls.map(
                        url => `<br /><a href="${url}">${url}</a>`
                    )}`,
                    () => this.originEventsStore.resetMatchingCertificates(user.id)
                );
            }

            if (partiallyFilledDemands.length > 0) {
                await this.sendNotificationEmail(
                    EmailTypes.DEMAND_PARTIALLY_FILLED,
                    emailAddress,
                    `Matched the following certificates to your demands:\n${partiallyFilledDemands
                        .map(
                            match =>
                                `Matched certificate ${match.certificateId} with amount ${match.amount} Wh to demand ${match.demandId}.`
                        )
                        .join('\n')}`,
                    () => this.originEventsStore.resetPartiallyFilledDemands(user.id)
                );
            }

            if (fulfilledDemands.length > 0) {
                await this.sendNotificationEmail(
                    EmailTypes.DEMAND_FULFILLED,
                    emailAddress,
                    `Your following demand(s) have been fulfilled:\n${fulfilledDemands
                        .map(demandId => `Demand #${demandId}.`)
                        .join('\n')}`,
                    () => this.originEventsStore.resetFulfilledDemands(user.id)
                );
            }
        }
    }

    private async sendNotificationEmail(
        notificationType: EmailTypes,
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
