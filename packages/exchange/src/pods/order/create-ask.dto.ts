import { ProductDTO } from './product.dto';

export class CreateAskDTO {
    readonly volume: number;

    readonly price: number;

    readonly validFrom: Date;

    readonly product: ProductDTO;

    readonly userId: string;

    readonly assetId: string;
}
