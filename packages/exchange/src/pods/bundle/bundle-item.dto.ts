import { IsUUID, Validate } from 'class-validator';
import { IntUnitsOfEnergy } from '@energyweb/origin-backend-utils';

import { PositiveBNStringValidator } from '../../utils/positiveBNStringValidator';

export class BundleItemDTO {
    @IsUUID()
    assetId: string;

    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    volume: string;
}
