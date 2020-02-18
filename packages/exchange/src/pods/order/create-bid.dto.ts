import { ProductDTO } from './product.dto';

export class CreateBidDTO {
    readonly volume: string;

    readonly price: number;

    readonly validFrom: Date;

    readonly product: ProductDTO;

    readonly userId: string;
}
