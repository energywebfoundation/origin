import { IsUUID, Validate } from 'class-validator';

import { PositiveBNStringValidator } from '../../utils/positiveBNStringValidator';

export class BuyBundleDTO {
    @IsUUID()
    readonly bundleId: string;

    @Validate(PositiveBNStringValidator)
    readonly volume: string;
}
