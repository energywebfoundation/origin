import { ApiProperty, PickType } from '@nestjs/swagger';
import { Validate } from 'class-validator';
import { CertificateDTO } from './certificate.dto';
import { CertificateAmount } from '../types';
import { AmountValidator } from '../utils/amount.validator';

export class CertificateAmountDTO
    extends PickType(CertificateDTO, ['id'] as const)
    implements CertificateAmount
{
    @ApiProperty({ type: String })
    @Validate(AmountValidator)
    amount: string;
}
