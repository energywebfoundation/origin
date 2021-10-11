import { IntUnitsOfEnergy, PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Validate, ValidateIf, ValidateNested } from 'class-validator';
import { DelegatedTransferOptions } from '../utils/delegated-transfer.dto';

export class TransferCertificateDTO {
    @ApiProperty({ type: String })
    @IsString()
    to: string;

    @ApiPropertyOptional({ type: DelegatedTransferOptions })
    @IsOptional()
    @ValidateNested()
    delegated?: DelegatedTransferOptions;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    amount?: string;
}
