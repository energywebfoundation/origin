import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { AccountAsset } from './account-asset';

export class AccountBalance {
    @ApiProperty({ type: [AccountAsset] })
    @ValidateNested()
    @Type(() => AccountAsset)
    public readonly available: AccountAsset[];

    @ApiProperty({ type: [AccountAsset] })
    @ValidateNested()
    @Type(() => AccountAsset)
    public readonly locked: AccountAsset[];

    public constructor(accountBalance: Partial<AccountBalance>) {
        Object.assign(this, accountBalance);
    }
}
