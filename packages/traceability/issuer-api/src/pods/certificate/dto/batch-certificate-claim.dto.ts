import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsObject, IsEthereumAddress } from 'class-validator';

import { CertificateBatchOperations, IClaimData } from '@energyweb/issuer';
import { BatchCertificateTransferDTO } from './batch-certificate-transfer.dto';

export class BatchCertificateClaimDTO
    extends OmitType(BatchCertificateTransferDTO, ['to'] as const)
    implements Omit<CertificateBatchOperations.BatchCertificateClaim, 'amount'>
{
    @ApiProperty({ type: Object })
    @IsObject()
    claimData: IClaimData;

    @ApiPropertyOptional({ type: String })
    @IsEthereumAddress()
    to?: string;
}
