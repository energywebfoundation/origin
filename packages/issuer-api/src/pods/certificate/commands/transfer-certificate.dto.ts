import { ApiProperty } from '@nestjs/swagger';
import { DelegatedTransferOptions } from '../utils/delegated-transfer.dto';

export class TransferCertificateDTO {
    @ApiProperty()
    to: string;

    @ApiProperty({ required: false })
    delegated?: DelegatedTransferOptions;

    @ApiProperty({ required: false })
    amount?: string;
}
