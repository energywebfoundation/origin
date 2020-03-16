import { ProductDTO } from '../order/product.dto';
import { OrderDTO } from '../order/order.dto';
import { Demand } from './demand.entity';
import { Order } from '../order/order.entity';

export class DemandDTO {
    id: string;

    price: number;

    start: string;

    volumePerPeriod: string;

    periods: number;

    timeFrame: number;

    product: ProductDTO;

    bids: OrderDTO[];

    public static fromDemand(demand: Demand): DemandDTO {
        return {
            id: demand.id,
            price: demand.price,
            start: demand.start.toISOString(),
            volumePerPeriod: demand.volumePerPeriod.toString(10),
            periods: demand.periods,
            timeFrame: demand.timeFrame,
            product: demand.product,
            bids: demand.bids.map(
                (bid: Order): OrderDTO => ({
                    id: bid.id,
                    userId: bid.userId,
                    status: bid.status,
                    startVolume: bid.startVolume.toString(10),
                    currentVolume: bid.currentVolume.toString(10),
                    asset: bid.asset,
                    price: bid.price,
                    product: bid.product,
                    side: bid.side,
                    validFrom: bid.validFrom.toISOString(),
                    demandId: demand.id
                })
            )
        };
    }
}
