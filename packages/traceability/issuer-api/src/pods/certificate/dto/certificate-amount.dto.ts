import { IntUnitsOfEnergy } from '@energyweb/origin-backend-utils';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { Validate } from 'class-validator';
import { CertificateDTO } from './certificate.dto';
import { CertificateAmount } from '../types';

export class CertificateAmountDTO
    extends PickType(CertificateDTO, ['id'] as const)
    implements CertificateAmount
{
    @ApiProperty({ type: String })
    @Validate(IntUnitsOfEnergy)
    amount: string;
}
