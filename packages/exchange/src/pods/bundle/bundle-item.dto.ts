import { IsUUID, Validate } from 'class-validator';

import { PositiveBNStringValidator } from '../../utils/positiveBNStringValidator';
import { IntUnitsOfEnergy } from '../../utils/intUnitOfEnergy';

export class BundleItemDTO {
    @IsUUID()
    assetId: string;

    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    volume: string;
}
