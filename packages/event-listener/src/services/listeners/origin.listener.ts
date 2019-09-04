import Web3 from 'web3';

import { Certificate } from '@energyweb/origin';
import { User } from '@energyweb/user-registry';
import { Configuration, ContractEventHandler, EventHandlerManager } from '@energyweb/utils-general';

import { initOriginConfig } from '../../config/origin.config';
import { IEmail, IEmailServiceProvider } from '../email.service';
import { IEventListener } from './IEventListener';

import { SCAN_INTERVAL } from '../../index';

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

    private newCertificateCounters: object;
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
        this.notificationInterval = notificationInterval || 60000; // Default to 1 min intervals

        this.started = false;
        this.interval = null;
        this.resetCounters();
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
            const certOwner = await new User.Entity(newCertificate.owner, this.conf as any).sync();

            const certOwnerEmail = certOwner.offChainProperties.email

            if (this.newCertificateCounters[certOwnerEmail]) {
                this.newCertificateCounters[certOwnerEmail] += 1;
            } else {
                this.newCertificateCounters[certOwnerEmail] = 1;
            }
        });

        this.manager = new EventHandlerManager(SCAN_INTERVAL, this.conf);
        this.manager.registerEventHandler(certificateContractEventHandler);

        this.manager.start();
        this.interval = setInterval(this.notifyOwnersOfNewCertificates.bind(this), this.notificationInterval);

        this.started = true;
        this.conf.logger.info(`Started listener for ${this.originLookupAddress}`);
    }

    public notifyOwnersOfNewCertificates() {
        for (const ownerEmail in this.newCertificateCounters) {
            if (this.newCertificateCounters[ownerEmail] > 0) {
                this.conf.logger.info(`Sending email to ${ownerEmail}...`);

                const emailTemplate: IEmail = {
                    to: [ownerEmail],
                    subject: '[Origin] Certificates approved',
                    html: `
                        Local issuer approved your certificates. 
                        There are ${this.newCertificateCounters[ownerEmail]} new certificates in your inbox:
                        ${process.env.UI_BASE_URL}/${this.originLookupAddress}/certificates/inbox
                    `
                };
    
                this.emailService.send(emailTemplate);
                this.conf.logger.info('Sent.');
            }
        }

        this.resetCounters();
    }

    public resetCounters() {
        this.newCertificateCounters = {};
    }

    public stop(): void {
        clearInterval(this.interval);
        this.manager.stop();

        this.started = false;
    }
}
