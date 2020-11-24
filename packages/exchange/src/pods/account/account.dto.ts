import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

import { AccountBalance } from '../account-balance/account-balance';

export class AccountDTO {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    public address: string;

    @ApiProperty({ type: AccountBalance })
    @ValidateNested()
    @Type(() => AccountBalance)
    public balances: AccountBalance;

    public constructor(account: Partial<AccountDTO>) {
        Object.assign(this, account);
    }
}
