import { Trade } from './trade.entity';

export class TradeDTO {
    public id: string;

    public created: string;

    public volume: string;

    public price: number;

    public bidId: string;

    public askId: string;

    public static fromTrade(trade: Trade): TradeDTO {
        return {
            id: trade.id,
            created: trade.created.toISOString(),
            price: trade.price,
            volume: trade.volume.toString(10),
            bidId: trade.bid?.id,
            askId: trade.ask?.id
        };
    }
}
