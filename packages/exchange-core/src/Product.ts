export class Product {
    public assetType?: string[];

    public location?: string[];

    public deviceVintage?: number;

    public matches(product: Product) {
        return product.assetType != null;
    }
}
