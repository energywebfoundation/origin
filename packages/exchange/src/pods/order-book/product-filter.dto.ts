// eslint-disable-next-line max-classes-per-file
import { Filter, ProductFilter } from '@energyweb/exchange-core';
import { IsEnum, Validate } from 'class-validator';

import { FilterValidator } from '../../utils/filterValidator';
import { ProductDTO } from '../order/product.dto';

export class ProductFilterDTO extends ProductDTO {
    @IsEnum(Filter)
    @Validate(FilterValidator, ['deviceType'])
    public deviceTypeFilter: Filter;

    @IsEnum(Filter)
    @Validate(FilterValidator, ['location'])
    public locationFilter: Filter;

    @IsEnum(Filter)
    @Validate(FilterValidator, ['deviceVintage'])
    public deviceVintageFilter: Filter;

    @IsEnum(Filter)
    @Validate(FilterValidator, ['generationFrom', 'generationTo'])
    public generationTimeFilter: Filter;

    public static toProductFilter(productFilter: ProductFilterDTO): ProductFilter {
        return {
            ...ProductDTO.toProduct(productFilter),
            deviceTypeFilter: productFilter.deviceTypeFilter,
            locationFilter: productFilter.locationFilter,
            deviceVintageFilter: productFilter.deviceVintageFilter,
            generationTimeFilter: productFilter.generationTimeFilter
        };
    }
}
