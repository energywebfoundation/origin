import { Product } from './Product';

export enum Filter {
    All,
    Specific,
    Unspecified
}

export class ProductFilter extends Product {
    deviceTypeFilter: Filter = Filter.All;

    locationFilter: Filter = Filter.All;

    deviceVintageFilter: Filter = Filter.All;

    generationTimeFilter: Filter = Filter.All;

    gridOperatorFilter: Filter = Filter.All;
}
