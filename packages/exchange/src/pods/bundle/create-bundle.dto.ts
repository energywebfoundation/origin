import { IsInt, IsPositive, ValidateNested, ArrayMinSize } from 'class-validator';

import { BundleItemDTO } from './bundle-item.dto';

export class CreateBundleDTO {
    @IsInt()
    @IsPositive()
    price: number;

    @ValidateNested()
    @ArrayMinSize(2)
    items: BundleItemDTO[];
}
