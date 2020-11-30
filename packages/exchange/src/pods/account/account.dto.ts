import { ApiProperty } from '@nestjs/swagger';

export class AccountDTO {
    @ApiProperty({ type: String })
    public address: string;
}
