import * as Configuration from './Configuration';

export class ContractEventHandler {
    lastBlockChecked: number;
    unhandledEvents: any[];
    contractInstance: any;
    onEventRegistry: Map<string, any>;
    onAnyContractEventRegistry: any[];

    constructor(contractInstance: any, lastBlockChecked: number) {
        this.contractInstance = contractInstance;
        this.lastBlockChecked = lastBlockChecked;
        this.unhandledEvents = [];
        this.walkThroughUnhandledEvent = this.walkThroughUnhandledEvent.bind(this);
        this.onEventRegistry = new Map<string, any>();
        this.onAnyContractEventRegistry = [];
    }

    async tick(configuration: Configuration.Entity) {
        try {
            const blockNumber = await configuration.blockchainProperties.web3.eth.getBlockNumber();

            if (blockNumber > this.lastBlockChecked) {
                const events = await this.contractInstance
                    .getWeb3Contract()
                    .getPastEvents('allEvents', {
                        fromBlock: Math.min(this.lastBlockChecked + 1, blockNumber),
                        toBlock: blockNumber
                    });
                this.unhandledEvents = events.reverse().concat(this.unhandledEvents);
                this.lastBlockChecked = blockNumber;
                this.walkThroughUnhandledEvent();
            }
        } catch (error) {
            console.log('ContractEventHandler::tick(): Error', error);
        }
    }

    walkThroughUnhandledEvent() {
        if (this.unhandledEvents.length > 0) {
            const event: any = this.unhandledEvents.pop();

            if (this.onEventRegistry.get(event.event)) {
                this.onEventRegistry
                    .get(event.event)
                    .forEach((onEvent: Function) => onEvent(event));
            }
            this.onAnyContractEventRegistry.forEach((onEvent: Function) => onEvent(event));
            this.walkThroughUnhandledEvent();
        }
    }

    onEvent(eventName: string, onEvent: Function) {
        if (!this.onEventRegistry.get(eventName)) {
            this.onEventRegistry.set(eventName, []);
        }

        const currentOnEvents = this.onEventRegistry.get(eventName);
        currentOnEvents.push(onEvent);
        // this.onEventRegistry[eventName].push(onEvent);
    }

    onAnyContractEvent(onEvent: Function) {
        this.onAnyContractEventRegistry.push(onEvent);
    }
}
