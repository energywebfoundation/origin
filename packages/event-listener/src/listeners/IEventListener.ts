export interface IEventListener {
    started: boolean;
    stop: () => void;
    start: () => Promise<void>;
}
