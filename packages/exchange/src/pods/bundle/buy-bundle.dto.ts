import { IsUUID, Validate } from 'class-validator';
import { PositiveBNStringValidator } from '@energyweb/origin-backend-utils';

export class BuyBundleDTO {
    @IsUUID()
    readonly bundleId: string;

    @Validate(PositiveBNStringValidator)
    readonly volume: string;
}
