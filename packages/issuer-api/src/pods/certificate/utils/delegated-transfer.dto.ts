import { ApiProperty } from '@nestjs/swagger';

export class DelegatedTransferOptions {
    @ApiProperty()
    from?: string;

    @ApiProperty()
    signature: string;
}
