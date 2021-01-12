export interface IMatchableProduct<TProduct, TProductFilter> {
    product: TProduct;
    matches(product: TProduct): boolean;
    filter(filter: TProductFilter): boolean;
}
