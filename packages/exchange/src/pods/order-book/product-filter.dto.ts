// eslint-disable-next-line max-classes-per-file
import { Filter, ProductFilter } from '@energyweb/exchange-core';
import { IsEnum } from 'class-validator';

import { ProductDTO } from '../order/product.dto';

export class ProductFilterDTO extends ProductDTO {
    @IsEnum(Filter)
    public deviceTypeFilter: Filter;

    @IsEnum(Filter)
    public locationFilter: Filter;

    @IsEnum(Filter)
    public deviceVintageFilter: Filter;

    public static toProductFilter(productFilter: ProductFilterDTO): ProductFilter {
        return {
            ...ProductDTO.toProduct(productFilter),
            deviceTypeFilter: productFilter.deviceTypeFilter,
            locationFilter: productFilter.locationFilter,
            deviceVintageFilter: productFilter.deviceVintageFilter
        };
    }
}
