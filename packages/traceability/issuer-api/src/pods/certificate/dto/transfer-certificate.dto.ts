import { IntUnitsOfEnergy, PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Validate, ValidateNested } from 'class-validator';
import { DelegatedTransferOptions } from '../utils/delegated-transfer.dto';

export class TransferCertificateDTO {
    @ApiProperty({
        type: String,
        example: '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8',
        description: 'Public blockchain address'
    })
    @IsString()
    to: string;

    @ApiPropertyOptional({ type: DelegatedTransferOptions })
    @IsOptional()
    @ValidateNested()
    delegated?: DelegatedTransferOptions;

    @ApiPropertyOptional({ type: String, example: '1000' })
    @IsOptional()
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    amount?: string;
}
