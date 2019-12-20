import Web3 from 'web3';
import polly from 'polly-js';

import { ProducingDevice } from '@energyweb/device-registry';
import { Demand, MarketUser, PurchasableCertificate, NoneCurrency } from '@energyweb/market';
import { MatchableDemand } from '@energyweb/market-matcher-core';
import { Configuration, ContractEventHandler, EventHandlerManager } from '@energyweb/utils-general';

import { IEventListenerConfig } from '../config/IEventListenerConfig';
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
    public web3: Web3;

    public started: boolean;

    public conf: Configuration.Entity;

    public manager: EventHandlerManager;

    private interval: any;

    constructor(
        public config: IEventListenerConfig,
        public marketLookupAddress: string,
        public emailService: IEmailServiceProvider,
        private originEventsStore: IOriginEventsStore
    ) {
        this.web3 = new Web3(config.web3Url || 'http://localhost:8550');
        this.started = false;
        this.interval = null;
    }

    public async start(): Promise<void> {
        this.conf = await initOriginConfig(this.marketLookupAddress, this.web3, this.config);

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

            const newCertificate: PurchasableCertificate.Entity = await new PurchasableCertificate.Entity(
                certId,
                this.conf
            ).sync();

            const { owner } = newCertificate.certificate;

            this.originEventsStore.registerIssuedCertificate(owner);

            const certificateOwner = await new MarketUser.Entity(owner, this.conf).sync();
            const autoPublishSettings = (certificateOwner.offChainProperties as MarketUser.IMarketUserOffChainProperties)
                .autoPublish;

            if (autoPublishSettings.enabled) {
                this.conf.logger.info(
                    `Automatically publishing Certificate #${newCertificate.id} for sale...`
                );
                await newCertificate.publishForSale(
                    autoPublishSettings.price,
                    autoPublishSettings.currency
                );
                this.conf.logger.info(
                    `Automatically published Certificate #${newCertificate.id} for sale.`
                );
            }
        });

        marketContractEventHandler.onEvent('LogPublishForSale', async (event: any) => {
            const fetchCertificate = async (
                certificateId: string
            ): Promise<PurchasableCertificate.Entity> => {
                const certificate = await new PurchasableCertificate.Entity(
                    certificateId,
                    this.conf
                ).sync();

                if (
                    certificate.forSale &&
                    certificate.isOffChainSettlement &&
                    certificate.currency === NoneCurrency &&
                    certificate.price === 0
                ) {
                    throw new Error(`[Certificate #${certificateId}] Missing settlement options`);
                }

                return certificate;
            };

            const publishedCertificate: PurchasableCertificate.IPurchasableCertificate = await polly()
                .waitAndRetry(10)
                .executeForPromise(() => fetchCertificate(event.returnValues._certificateId));

            this.conf.logger.info(
                `Event: LogPublishForSale certificate #${publishedCertificate.id} at ${publishedCertificate.price} ${publishedCertificate.currency}`
            );

            const demands = await Demand.getAllDemands(this.conf);

            const producingDevice = await new ProducingDevice.Entity(
                publishedCertificate.certificate.deviceId.toString(),
                this.conf
            ).sync();

            const demandsMatchCertificate: Demand.Entity[] = [];

            for (const demand of demands) {
                const { result } = await new MatchableDemand(demand).matchesCertificate(
                    publishedCertificate,
                    producingDevice
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
            const { _demandId, _certificateId, _amount } = event.returnValues;

            const demand = await new Demand.Entity(_demandId, this.conf).sync();

            this.originEventsStore.registerPartiallyFilledDemand(demand.demandOwner, {
                demandId: _demandId,
                certificateId: _certificateId,
                amount: _amount
            });

            this.conf.logger.info(
                `Event: DemandPartiallyFilled: Matched certificate #${_certificateId} with energy ${_amount} to Demand #${_demandId}.`
            );

            if (await demand.isFulfilled()) {
                this.originEventsStore.registerFulfilledDemand(demand.demandOwner, _demandId);

                this.conf.logger.info(`DemandFulfilled: Demand #${_demandId} has been fulfilled.`);
            }
        });

        this.manager = new EventHandlerManager(this.config.scanInterval, this.conf);
        this.manager.registerEventHandler(certificateContractEventHandler);
        this.manager.registerEventHandler(marketContractEventHandler);

        this.manager.start();
        this.interval = setInterval(this.notify.bind(this), this.config.notificationInterval);

        this.started = true;
        this.conf.logger.info(`Started listener for ${this.marketLookupAddress}`);
        this.conf.logger.info(
            `Running the listener with account ${
                this.web3.eth.accounts.privateKeyToAccount(this.config.accountPrivKey).address
            }`
        );
    }

    private async notify() {
        const allUsers: Promise<
            MarketUser.Entity
        >[] = this.originEventsStore
            .getAllUsers()
            .map(async userId => new MarketUser.Entity(userId, this.conf).sync());
        const notifyUsers: MarketUser.Entity[] = (await Promise.all(allUsers)).filter(
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
