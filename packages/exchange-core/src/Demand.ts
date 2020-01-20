import { Product } from './Product';

export class Demand {
    public validFrom: number;

    public validTo: number;

    public interval: number;

    public volumePerInterval: number;

    public pricePerMWh: number;

    public product: Product;
}
