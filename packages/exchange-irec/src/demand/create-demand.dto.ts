import { CreateDemandDTO as BaseCreateDemandDTO } from '@energyweb/exchange';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { ProductDTO } from '../product/product.dto';

export class CreateDemandDTO extends BaseCreateDemandDTO<ProductDTO> {
    @ApiProperty({ type: ProductDTO })
    @IsNotEmpty()
    @Type(() => ProductDTO)
    @ValidateNested()
    public readonly product: ProductDTO;
}
