import { IsInt, IsPositive, ValidateNested, ArrayMinSize, IsNotEmpty } from 'class-validator';

import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BundleItemDTO } from './bundle-item.dto';

export class CreateBundleDTO {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    price: number;

    @ApiProperty({ type: [BundleItemDTO] })
    @ValidateNested()
    @Type(() => BundleItemDTO)
    @ArrayMinSize(2)
    items: BundleItemDTO[];
}
