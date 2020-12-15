import { IRECProduct } from './IRECProduct';

export enum Filter {
    All,
    Specific,
    Unspecified
}

export class IRECProductFilter extends IRECProduct {
    deviceTypeFilter: Filter = Filter.All;

    locationFilter: Filter = Filter.All;

    deviceVintageFilter: Filter = Filter.All;

    generationTimeFilter: Filter = Filter.All;

    gridOperatorFilter: Filter = Filter.All;
}
