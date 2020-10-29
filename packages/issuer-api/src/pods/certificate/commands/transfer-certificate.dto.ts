import { IntUnitsOfEnergy, PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Validate, ValidateIf, ValidateNested } from 'class-validator';
import { DelegatedTransferOptions } from '../utils/delegated-transfer.dto';

export class TransferCertificateDTO {
    @ApiProperty({ type: String })
    @IsString()
    to: string;

    @ValidateNested()
    @ApiProperty({ type: DelegatedTransferOptions, required: false })
    delegated?: DelegatedTransferOptions;

    @ApiProperty({ type: String, required: false })
    @ValidateIf((dto: TransferCertificateDTO) => !!dto.amount)
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    amount?: string;
}
