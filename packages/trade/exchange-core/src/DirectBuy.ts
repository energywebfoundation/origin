import BN from 'bn.js';

export class DirectBuy {
    public get volume() {
        return this._volume;
    }

    public get isFilled() {
        return this.volume.isZero();
    }

    constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly price: number,
        private _volume: BN,
        public readonly askId: string,
        public readonly createdAt: Date
    ) {}

    public clone(): DirectBuy {
        return new DirectBuy(
            this.id,
            this.userId,
            this.price,
            this.volume,
            this.askId,
            this.createdAt
        );
    }

    public updateWithTradedVolume(tradedVolume: BN) {
        if (tradedVolume.gt(this.volume)) {
            throw new Error('Order overmatched');
        }
        this._volume = this._volume.sub(tradedVolume);

        return this;
    }
}
