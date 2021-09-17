import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { AccountType } from '@energyweb/issuer-irec-api-wrapper';

export class AccountDetailsDTO {
    @ApiProperty({ type: String })
    name: string;

    @ApiProperty({ type: Boolean })
    private: boolean;

    @ApiProperty({ type: Boolean })
    restricted: boolean;

    @ApiProperty({ type: Boolean })
    active: boolean;

    @ApiProperty({ type: String })
    notes: string;

    @ApiProperty({ type: String })
    countryCode?: string;
}

export class AccountDTO {
    @ApiProperty({ type: String })
    code: string;

    @ApiProperty({
        type: String,
        enum: [AccountType.Trade, AccountType.Redemption, AccountType.Issue]
    })
    type: AccountType;

    @ApiProperty({ type: AccountDetailsDTO })
    @ValidateNested()
    details: AccountDetailsDTO;
}
