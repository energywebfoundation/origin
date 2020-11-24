import { ApiProperty } from '@nestjs/swagger';
import BN from 'bn.js';
import { Transform, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { Asset } from '../asset/asset.entity';

export class AccountAsset {
    @ApiProperty({ type: Asset })
    @ValidateNested()
    @Type(() => Asset)
    public asset: Asset;

    @ApiProperty({ type: String })
    @Transform((value: BN) => value.toString(10))
    public amount: BN;

    public constructor(accountAsset: Partial<AccountAsset>) {
        Object.assign(this, accountAsset);
    }
}
