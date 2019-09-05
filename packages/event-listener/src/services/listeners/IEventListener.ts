import Web3 from 'web3';

export interface IEventListener {
    web3: Web3;
    started: boolean;
    stop: () => void;
    start: () => Promise<void>;
}
