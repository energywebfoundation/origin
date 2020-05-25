import { IsInt, IsPositive, ValidateNested } from 'class-validator';

import { BundleItemDTO } from './bundle-item.dto';

export class CreateBundleDTO {
    @IsInt()
    @IsPositive()
    price: number;

    @ValidateNested()
    items: BundleItemDTO[];
}
