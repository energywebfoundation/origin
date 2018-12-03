import Web3Type from '../types/web3';
import { ContractEventHandler } from './ContractEventHandler';
import * as Configuration from './Configuration';

export class EventHandlerManager {
    private contractEventHandlers: ContractEventHandler[];
    private tickTime: number;
    private running: boolean;
    private configuration: Configuration.Entity;

    constructor(tickTime: number, configuration: Configuration.Entity) {
        this.tickTime = tickTime;
        this.configuration = configuration;
        this.contractEventHandlers = [];
    }

    registerEventHandler(eventHandler: ContractEventHandler) {
        this.contractEventHandlers.push(eventHandler);
    }

    start() {
        this.running = true;
        this.loop();

    }

    stop() {
        this.running = false;
    }

    async loop() {
        while (this.running) {
            this.contractEventHandlers.forEach((eventHandler: ContractEventHandler) => eventHandler.tick(this.configuration));
            await this.sleep(this.tickTime);
        }
    }

    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

}
