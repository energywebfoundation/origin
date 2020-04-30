import { Trade } from './trade.entity';
import { ProductDTO } from '../order/product.dto';

export class TradeDTO {
    public id: string;

    public created: string;

    public volume: string;

    public price: number;

    public bidId: string;

    public askId: string;

    public product: ProductDTO;

    public assetId: string;

    public static fromTrade(trade: Trade, assetId: string, product: ProductDTO): TradeDTO {
        return {
            id: trade.id,
            created: trade.created.toISOString(),
            price: trade.price,
            volume: trade.volume.toString(10),
            bidId: trade.bid?.id,
            askId: trade.ask?.id,
            assetId,
            product
        };
    }
}
