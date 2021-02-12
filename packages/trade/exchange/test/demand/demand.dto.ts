import { ApiProperty } from '@nestjs/swagger';

import { DemandDTO as BaseDemandDTO } from '../../src/pods/demand/demand.dto';

export class DemandDTO extends BaseDemandDTO<string> {
    @ApiProperty({ type: String })
    product: string;
}
