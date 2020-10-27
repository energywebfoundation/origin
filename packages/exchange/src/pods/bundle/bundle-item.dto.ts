import { IsUUID, Validate } from 'class-validator';
import { IntUnitsOfEnergy, PositiveBNStringValidator } from '@energyweb/origin-backend-utils';

export class BundleItemDTO {
    @IsUUID()
    assetId: string;

    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    volume: string;
}
