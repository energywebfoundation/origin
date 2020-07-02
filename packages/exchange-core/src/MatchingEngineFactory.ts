import { IDeviceTypeService, ILocationService } from '@energyweb/utils-general';

import { IPriceStrategy } from './strategy/IPriceStrategy';
import { MatchingEngine } from '.';
import { OrderCreationTimePickStrategy } from './strategy/OrderCreationTimePickStrategy';
import { AskPriceStrategy } from './strategy/AskPriceStrategy';

export enum PriceStrategy {
    AskPrice,
    BasedOnOrderCreationTime
}

export class MatchingEngineFactory {
    public static build(
        priceStrategy: PriceStrategy | IPriceStrategy,
        deviceService: IDeviceTypeService,
        locationService: ILocationService
    ): MatchingEngine {
        const strategy = this.isStrategy(priceStrategy)
            ? (priceStrategy as IPriceStrategy)
            : this.getStrategy(priceStrategy as PriceStrategy);

        return new MatchingEngine(deviceService, locationService, strategy);
    }

    private static isStrategy(pricePickStrategy: PriceStrategy | IPriceStrategy) {
        return (pricePickStrategy as IPriceStrategy).pickPrice !== undefined;
    }

    private static getStrategy(pricePickStrategy: PriceStrategy) {
        const strategy = typeof pricePickStrategy !== 'number'
            ? Number(pricePickStrategy)
            : pricePickStrategy;

        switch (strategy) {
            case PriceStrategy.AskPrice:
                return new AskPriceStrategy();
            case PriceStrategy.BasedOnOrderCreationTime:
                return new OrderCreationTimePickStrategy();
            default:
                return null;
        }
    }
}
