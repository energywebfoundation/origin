import polly from 'polly-js';

import { ProducingDevice } from '@energyweb/device-registry';
import { Demand, MarketUser, PurchasableCertificate, NoneCurrency } from '@energyweb/market';
import { MatchableDemand } from '@energyweb/market-matcher-core';
import { Configuration, ContractEventHandler, EventHandlerManager } from '@energyweb/utils-general';

import {
    SupportedEvents,
    IEvent,
    DeviceStatusChanged,
    DemandPartiallyFilledEvent
} from '@energyweb/origin-backend-core';
import { IEventListenerConfig } from '../config/IEventListenerConfig';
import { IEventListener } from './IEventListener';
import { IOriginEventsStore } from '../stores/OriginEventsStore';
import { IEmailServiceProvider } from '../services/email.service';
import { INotificationService, NotificationService } from '../services/notification.service';

export interface IOriginEventListener extends IEventListener {
    marketLookupAddress: string;
    emailService: IEmailServiceProvider;
}

export class OriginEventListener implements IOriginEventListener {
    public started: boolean;

    public manager: EventHandlerManager;

    private notificationService: INotificationService;

    private interval: any;

    constructor(
        public conf: Configuration.Entity,
        public listenerConfig: IEventListenerConfig,
        public marketLookupAddress: string,
        public emailService: IEmailServiceProvider,
        private originEventsStore: IOriginEventsStore
    ) {
        this.started = false;
        this.interval = null;
    }

    public async start(): Promise<void> {
        this.notificationService = new NotificationService(
            this.conf,
            this.emailService,
            this.originEventsStore
        );

        const currentBlockNumber: number = await this.conf.blockchainProperties.web3.eth.getBlockNumber();

        const certificateContractEventHandler = new ContractEventHandler(
            this.conf.blockchainProperties.certificateLogicInstance,
            currentBlockNumber
        );
        const marketContractEventHandler = new ContractEventHandler(
            this.conf.blockchainProperties.marketLogicInstance,
            currentBlockNumber
        );
        const deviceContractEventHandler = new ContractEventHandler(
            this.conf.blockchainProperties.deviceLogicInstance,
            currentBlockNumber
        );

        try {
            this.conf.offChainDataSource.eventClient.subscribe(
                SupportedEvents.DEVICE_STATUS_CHANGED,
                async (event: IEvent) => {
                    const { deviceId, status } = event.data as DeviceStatusChanged;
                    this.conf.logger.info(
                        `Event: DeviceStatusChanged #${deviceId} to status ${status}`
                    );

                    const device = await new ProducingDevice.Entity(deviceId, this.conf).sync();

                    this.originEventsStore.registerDeviceStatusChange(
                        device.owner.address,
                        deviceId,
                        status
                    );
                }
            );
        } catch (e) {
            console.error(e);
        }

        certificateContractEventHandler.onEvent('LogCreatedCertificate', async (event: any) => {
            const certId = event.returnValues._certificateId;
            this.conf.logger.info(`Event: LogCreatedCertificate certificate #${certId}`);

            const newCertificate = await new PurchasableCertificate.Entity(
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
                    autoPublishSettings.priceInCents,
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

        this.conf.offChainDataSource.eventClient.subscribe(
            SupportedEvents.DEMAND_PARTIALLY_FILLED,
            async (event: IEvent) => {
                const {
                    demandId,
                    certificateId,
                    energy
                } = event.data as DemandPartiallyFilledEvent;

                const demand = await new Demand.Entity(demandId, this.conf).sync();

                this.originEventsStore.registerPartiallyFilledDemand(demand.owner, {
                    demandId,
                    certificateId: Number(certificateId),
                    amount: energy
                });

                this.conf.logger.info(
                    `Event: DemandPartiallyFilled: Matched certificate #${certificateId} with energy ${energy} to Demand #${demandId}.`
                );

                if (await demand.isFulfilled()) {
                    this.originEventsStore.registerFulfilledDemand(demand.owner, demandId);

                    this.conf.logger.info(
                        `DemandFulfilled: Demand #${demandId} has been fulfilled.`
                    );
                }
            }
        );

        this.manager = new EventHandlerManager(this.listenerConfig.scanInterval, this.conf);
        this.manager.registerEventHandler(deviceContractEventHandler);
        this.manager.registerEventHandler(certificateContractEventHandler);
        this.manager.registerEventHandler(marketContractEventHandler);

        this.manager.start();
        this.interval = setInterval(
            this.notificationService.notify.bind(this.notificationService),
            this.listenerConfig.notificationInterval
        );

        this.started = true;
        this.conf.logger.info(`Started listener for ${this.marketLookupAddress}`);
        this.conf.logger.info(
            `Running the listener with account ${
                this.conf.blockchainProperties.web3.eth.accounts.privateKeyToAccount(
                    this.listenerConfig.accountPrivKey
                ).address
            }`
        );
    }

    public stop(): void {
        clearInterval(this.interval);
        this.manager.stop();

        this.started = false;
    }
}
