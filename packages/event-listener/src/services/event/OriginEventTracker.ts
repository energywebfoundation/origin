import Web3 from 'web3';

import { Certificate } from '@energyweb/origin';
import { User } from '@energyweb/user-registry';
import { Configuration, ContractEventHandler, EventHandlerManager } from '@energyweb/utils-general';

import { initConfig } from '../../config/initConfig';
import { IEmail, IEmailServiceProvider } from '../email.service';

import { SCAN_INTERVAL } from '../../index';

interface IOriginEventTracker {
    originLookupAddress: string;
    web3: Web3;
    started: boolean;
    stop: () => void;
    start: () => Promise<void>;
}

export class OriginEventTracker implements IOriginEventTracker {
    public originLookupAddress: string;
    public web3: Web3;
    public started: boolean;

    public conf: Configuration.Entity;
    public manager: EventHandlerManager;
    public emailService: IEmailServiceProvider;

    constructor(
        originLookupAddress: string,
        web3: Web3,
        emailService?: IEmailServiceProvider
    ) {
        this.originLookupAddress = originLookupAddress;
        this.web3 = web3;

        this.emailService = emailService;
        this.started = false;
    }

    public async start(): Promise<void> {
        this.conf = await initConfig(this.originLookupAddress, this.web3);

        const currentBlockNumber = await this.conf.blockchainProperties.web3.eth.getBlockNumber();
        const certificateContractEventHandler = new ContractEventHandler(
            this.conf.blockchainProperties.certificateLogicInstance,
            currentBlockNumber
        );

        certificateContractEventHandler.onEvent('LogCreatedCertificate', async (event: any) => {
            const certId = event.returnValues._certificateId;
            console.log(`Event: LogCreatedCertificate certificate #${certId}`);

            const newCertificate = await new Certificate.Entity(certId, this.conf).sync();
            const certOwner = await new User.Entity(newCertificate.owner, this.conf as any).sync();

            console.log(`Sending email to ${certOwner.offChainProperties.email}...`);
            const email: IEmail = {
                to: [certOwner.offChainProperties.email],
                subject: `${certId}`,
                html: `<strong>${certId}</strong>`
            };

            this.emailService.send(email);
            console.log('Sent.');
        });

        this.manager = new EventHandlerManager(SCAN_INTERVAL, this.conf);
        this.manager.registerEventHandler(certificateContractEventHandler);
        this.manager.start();

        this.started = true;
        console.log('Started tracker for  ' + this.originLookupAddress);
    }

    public stop(): void {
        this.manager.stop();
        this.started = false;
    }
}
