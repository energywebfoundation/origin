import { IsUUID, Validate } from 'class-validator';

import { PositiveBNStringValidator } from '../../utils/positiveBNStringValidator';

export class BundleItemDTO {
    @IsUUID()
    assetId: string;

    @Validate(PositiveBNStringValidator)
    volume: string;
}
