import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Validate, IsOptional, IsEthereumAddress } from 'class-validator';

import { IntUnitsOfEnergy } from '@energyweb/origin-backend-utils';
import { CertificateBatchOperations } from '@energyweb/issuer';

import { CertificateDTO } from './certificate.dto';

export class BatchCertificateTransferDTO
    extends PickType(CertificateDTO, ['id'] as const)
    implements Omit<CertificateBatchOperations.BatchCertificateTransfer, 'amount'>
{
    @ApiProperty({ type: String })
    @IsEthereumAddress()
    to: string;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @IsEthereumAddress()
    from?: string;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @Validate(IntUnitsOfEnergy)
    amount?: string;
}
