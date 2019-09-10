
// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Heiko Burkhardt, heiko.burkhardt@slock.it; Martin Kuechler, martin.kuchler@slock.it

import * as Configuration from './Configuration';
export class ContractEventHandler {
    lastBlockChecked: number;
    unhandledEvents: any[];
    contractInstance: any;

    onEventRegistry: any[];
    onAnyContractEventRegistry: any[];

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

        if (blockNumber > this.lastBlockChecked) {
            const events = await this.contractInstance.getWeb3Contract().getPastEvents('allEvents', {
                fromBlock: Math.min(this.lastBlockChecked + 1, blockNumber),
                toBlock: blockNumber
            });
            this.unhandledEvents = events.reverse().concat(this.unhandledEvents);
            this.lastBlockChecked = blockNumber;
            this.walkThroughUnhandledEvent();
        }
    }

    walkThroughUnhandledEvent() {
        if (this.unhandledEvents.length > 0) {
            const event = this.unhandledEvents.pop();

            if (this.onEventRegistry[event.event]) {
                this.onEventRegistry[event.event].forEach(onEvent => onEvent(event));
            }
            this.onAnyContractEventRegistry.forEach(onEvent => onEvent(event));
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
