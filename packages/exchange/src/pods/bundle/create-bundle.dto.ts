import { IsInt, IsPositive, ValidateNested, ArrayMinSize } from 'class-validator';

import { Type } from 'class-transformer';
import { BundleItemDTO } from './bundle-item.dto';

export class CreateBundleDTO {
    @IsInt()
    @IsPositive()
    price: number;

    @ValidateNested()
    @Type(() => BundleItemDTO)
    @ArrayMinSize(2)
    items: BundleItemDTO[];
}
