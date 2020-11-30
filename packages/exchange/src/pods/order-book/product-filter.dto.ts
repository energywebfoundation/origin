// eslint-disable-next-line max-classes-per-file
import { Filter, ProductFilter } from '@energyweb/exchange-core';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, Validate, IsOptional } from 'class-validator';

import { FilterValidator } from '../../utils/filterValidator';
import { ProductDTO } from '../order/product.dto';

export class ProductFilterDTO extends ProductDTO {
    @ApiProperty({ enum: Filter, enumName: 'Filter', required: false })
    @IsOptional()
    @IsEnum(Filter)
    @Validate(FilterValidator, ['deviceType'])
    public deviceTypeFilter?: Filter;

    @ApiProperty({ enum: Filter, enumName: 'Filter', required: false })
    @IsOptional()
    @IsEnum(Filter)
    @Validate(FilterValidator, ['location'])
    public locationFilter?: Filter;

    @ApiProperty({ enum: Filter, enumName: 'Filter', required: false })
    @IsOptional()
    @IsEnum(Filter)
    @Validate(FilterValidator, ['deviceVintage'])
    public deviceVintageFilter?: Filter;

    @ApiProperty({ enum: Filter, enumName: 'Filter', required: false })
    @IsOptional()
    @IsEnum(Filter)
    @Validate(FilterValidator, ['generationFrom', 'generationTo'])
    public generationTimeFilter?: Filter;

    @ApiProperty({ enum: Filter, enumName: 'Filter', required: false })
    @IsOptional()
    @IsEnum(Filter)
    @Validate(FilterValidator, ['gridOperator'])
    public gridOperatorFilter?: Filter;

    public static toProductFilter(productFilter: ProductFilterDTO): ProductFilter {
        return {
            ...ProductDTO.toProduct(productFilter),
            deviceTypeFilter: productFilter.deviceTypeFilter ?? Filter.All,
            locationFilter: productFilter.locationFilter ?? Filter.All,
            deviceVintageFilter: productFilter.deviceVintageFilter ?? Filter.All,
            generationTimeFilter: productFilter.generationTimeFilter ?? Filter.All,
            gridOperatorFilter: productFilter.gridOperatorFilter ?? Filter.All
        };
    }
}
