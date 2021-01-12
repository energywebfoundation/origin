import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

import { CreateDemandDTO as BaseCreateDemandDTO } from '../../src/pods/demand/create-demand.dto';

export class CreateDemandDTO extends BaseCreateDemandDTO<string> {
    @IsNotEmpty()
    @Type(() => String)
    public readonly product: string;
}
