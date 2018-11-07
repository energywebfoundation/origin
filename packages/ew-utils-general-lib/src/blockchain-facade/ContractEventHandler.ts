import * as Configuration from './Configuration';

export default class ContractEventHandler {

    lastBlockChecked: number;
    unhandledEvents: any[];
    contractInstance: any;

    onEventRegistry: Function[][];
    onAnyContractEventRegistry: Function[];

    constructor(contractInstance: any, lastBlockChecked: number) {
        this.contractInstance = contractInstance;
        this.lastBlockChecked = lastBlockChecked;
        this.unhandledEvents = [];
        this.walkThroughUnhandledEvent = this.walkThroughUnhandledEvent.bind(this);
        this.onEventRegistry = [];
        this.onAnyContractEventRegistry = [];

    }

    async tick(configuration: Configuration.Entity) {

        const blockNumber = await configuration.blockchainProperties.web3.eth.getBlockNumber();
        const events = await this.contractInstance.getPastEvents('allEvents', { fromBlock: this.lastBlockChecked + 1, toBlock: blockNumber });
        this.unhandledEvents = events.reverse().concat(this.unhandledEvents);
        this.lastBlockChecked = blockNumber > this.lastBlockChecked ? blockNumber : this.lastBlockChecked;
        this.walkThroughUnhandledEvent();

    }

    walkThroughUnhandledEvent() {
        if (this.unhandledEvents.length > 0) {
            const event = this.unhandledEvents.pop();

            if (this.onEventRegistry[event.event]) {
                this.onEventRegistry[event.event].forEach((onEvent) => onEvent(event));
            }
            this.onAnyContractEventRegistry.forEach((onEvent) => onEvent(event));
            this.walkThroughUnhandledEvent();
        }

    }

    onEvent(eventName: string, onEvent: Function) {
        if (!this.onEventRegistry[eventName]) {
            this.onEventRegistry[eventName] = [];
        }
        this.onEventRegistry[eventName].push(onEvent);
    }

    onAnyContractEvent(onEvent: Function) {

        this.onAnyContractEventRegistry.push(onEvent);
    }

}
