import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { AccountAssetDTO } from './account-asset.dto';

export class AccountBalanceDTO {
    @ApiProperty({ type: [AccountAssetDTO] })
    @ValidateNested()
    @Type(() => AccountAssetDTO)
    public readonly available: AccountAssetDTO[];

    @ApiProperty({ type: [AccountAssetDTO] })
    @ValidateNested()
    @Type(() => AccountAssetDTO)
    public readonly locked: AccountAssetDTO[];

    public constructor(accountBalance: Partial<AccountBalanceDTO>) {
        Object.assign(this, accountBalance);
    }
}
