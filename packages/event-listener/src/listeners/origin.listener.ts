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

interface ICounter {
    user: User.Entity;
    newCertificates: number;
    matchedDemands: number;
}

export interface IOriginEventListener extends IEventListener {
    originLookupAddress: string;
    emailService: IEmailServiceProvider;
}

export class OriginEventListener implements IOriginEventListener {
    public originLookupAddress: string;

    public web3: Web3;

    public started: boolean;

    public notificationInterval: number;

    public conf: Configuration.Entity;

    public manager: EventHandlerManager;

    public emailService: IEmailServiceProvider;

    private counters: ICounter[] = [];

    private interval;

    constructor(
        originLookupAddress: string,
        web3: Web3,
        emailService: IEmailServiceProvider,
        notificationInterval?: number
    ) {
        this.originLookupAddress = originLookupAddress;
        this.web3 = web3;
        this.emailService = emailService;
        this.notificationInterval = notificationInterval || 6000; // Default to 1 min intervals

        this.started = false;
        this.interval = null;
    }

    public async start(): Promise<void> {
        this.conf = await initOriginConfig(this.originLookupAddress, this.web3);

        const currentBlockNumber = await this.conf.blockchainProperties.web3.eth.getBlockNumber();
        const certificateContractEventHandler = new ContractEventHandler(
            this.conf.blockchainProperties.certificateLogicInstance,
            currentBlockNumber
        );

        certificateContractEventHandler.onEvent('LogCreatedCertificate', async (event: any) => {
            const certId = event.returnValues._certificateId;
            this.conf.logger.info(`Event: LogCreatedCertificate certificate #${certId}`);

            const newCertificate = await new Certificate.Entity(certId, this.conf).sync();

            await this.incrementNewCertCounter(newCertificate);
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

            await this.checkDemands(publishedCertificate);
        });

        certificateContractEventHandler.onEvent('Transfer', async function(event: any) {
            const { _tokenId, _from, _to } = event.returnValues;
            const transferredCert = await new Certificate.Entity(_tokenId, this.conf).sync();

            this.conf.logger.info(
                `Event: Transfer: Certificate #${transferredCert.id} from ${_from} to ${_to}.`
            );
        });

        this.manager = new EventHandlerManager(SCAN_INTERVAL, this.conf);
        this.manager.registerEventHandler(certificateContractEventHandler);

        this.manager.start();
        this.interval = setInterval(this.notify.bind(this), this.notificationInterval);

        this.started = true;
        this.conf.logger.info(`Started listener for ${this.originLookupAddress}`);
    }

    public async notify() {
        for (const counter of this.counters) {
            const emailAddress = counter.user.offChainProperties.email;
            const notificationsEnabled = counter.user.offChainProperties.notifications;

            if (counter.newCertificates > 0 && notificationsEnabled) {
                this.conf.logger.info(`Sending email to ${emailAddress}...`);

                const response: IEmailResponse = await this.emailService.send({
                    to: [emailAddress],
                    subject: `[Origin] ${NotificationTypes.CERTS_APPROVED}`,
                    html: `
                        Local issuer approved your certificates. 
                        There are ${counter.newCertificates} new certificates in your inbox:
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

                counter.newCertificates = 0;
            }

            if (counter.matchedDemands > 0 && notificationsEnabled) {
                this.conf.logger.info(`Sending email to ${emailAddress}...`);

                const response: IEmailResponse = await this.emailService.send({
                    to: [emailAddress],
                    subject: `[Origin] ${NotificationTypes.DEMAND_MATCH}`,
                    html: `
                        We found ${counter.matchedDemands} matching your demand. Open Origin and check it out:
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

                counter.matchedDemands = 0;
            }
        }
    }

    public stop(): void {
        clearInterval(this.interval);
        this.manager.stop();

        this.started = false;
    }

    private async incrementNewCertCounter(certificate: Certificate.Entity): Promise<void> {
        const certOwner = await new User.Entity(certificate.owner, this.conf as any).sync();
        let userCounter: ICounter = this.counters.find(counter => counter.user.id === certOwner.id);

        if (userCounter) {
            userCounter.newCertificates += 1;
        } else {
            userCounter = {
                user: certOwner,
                newCertificates: 1,
                matchedDemands: 0
            };
            this.counters.push(userCounter);
        }

        this.conf.logger.info(
            `<${certOwner.offChainProperties.email}> New certificate approved. Buffered emails count: ${userCounter.newCertificates}`
        );
    }

    private async checkDemands(certificate: Certificate.Entity): Promise<void> {
        const demands = await Demand.getAllDemands(this.conf);

        const producingAsset = await new ProducingAsset.Entity(
            certificate.assetId.toString(),
            this.conf
        ).sync();

        const matchedDemands = demands.filter(demand => {
            const { result } = new MatchableDemand(demand).matchesCertificate(
                certificate,
                producingAsset
            );
            return result;
        });

        if (matchedDemands.length > 0) {
            for (const demand of matchedDemands) {
                const demandOwner = await new User.Entity(demand.demandOwner, this
                    .conf as any).sync();

                let userCounter = this.counters.find(counter => counter.user.id === demandOwner.id);

                if (userCounter) {
                    userCounter.matchedDemands += 1;
                } else {
                    userCounter = {
                        user: demandOwner,
                        newCertificates: 0,
                        matchedDemands: 1
                    };
                    this.counters.push(userCounter);
                }

                this.conf.logger.info(
                    `<${demandOwner.offChainProperties.email}> New certificate found for demand. Buffered emails count: ${userCounter.matchedDemands}`
                );
            }
        }
    }
}
