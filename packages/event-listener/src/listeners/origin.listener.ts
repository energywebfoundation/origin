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
import { IOriginEventsStore, IPartiallyFilledDemand } from '../stores/OriginEventsStore';

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
        const notifyUsers: User.Entity[] = this.originEventsStore
            .getAllUsers()
            .filter(user => user.offChainProperties.notifications);

        for (const user of notifyUsers) {
            const emailAddress: string = user.offChainProperties.email;
            const newIssuedCertificates: number = this.originEventsStore.getNewIssuedCertificates(
                user
            );
            const newMatchingCertificates: number = this.originEventsStore.getNewMatchingCertificates(
                user
            );
            const newPartiallyFilledDemand: IPartiallyFilledDemand[] = this.originEventsStore.getNewPartiallyFilledDemands(
                user
            );

            this.conf.logger.info(`Sending notification emails to ${emailAddress}...`);

            if (newIssuedCertificates > 0) {
                await this.emailService.send(
                    {
                        to: [emailAddress],
                        subject: `[Origin] ${NotificationTypes.CERTS_APPROVED}`,
                        html: `Local issuer approved your certificates.\nThere are ${newIssuedCertificates} new certificates in your inbox:\n${process.env.UI_BASE_URL}/${this.originLookupAddress}/certificates/inbox`
                    },
                    () => this.originEventsStore.resetNewIssuedCertificates(user)
                );
            }

            if (newMatchingCertificates > 0) {
                await this.emailService.send(
                    {
                        to: [emailAddress],
                        subject: `[Origin] ${NotificationTypes.FOUND_MATCHING_SUPPLY}`,
                        html: `We found ${newMatchingCertificates} certificates matching your demand. Open Origin and check it out:\n${process.env.UI_BASE_URL}/${this.originLookupAddress}/certificates/for_demand/`
                    },
                    () => this.originEventsStore.resetNewMatchingCertificates(user)
                );
            }

            if (newPartiallyFilledDemand.length > 0) {
                await this.emailService.send(
                    {
                        to: [emailAddress],
                        subject: `[Origin] ${NotificationTypes.DEMAND_PARTIALLY_FILLED}`,
                        html: `Matched the following certificates to your demands:\n${newPartiallyFilledDemand
                            .map(
                                match =>
                                    `Matched certificate ${match.certificateId} with amount ${match.amount} Wh to demand ${match.demandId}.`
                            )
                            .join('\n')}`
                    },
                    () => this.originEventsStore.resetNewMatchingCertificates(user)
                );
            }

            this.conf.logger.info('Sent.');
        }
    }

    public stop(): void {
        clearInterval(this.interval);
        this.manager.stop();

        this.started = false;
    }
}
