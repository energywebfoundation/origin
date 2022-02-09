import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsObject, IsEthereumAddress } from 'class-validator';

import { CertificateBatchOperations, IClaimData } from '@energyweb/issuer';
import { BatchCertificateTransferDTO } from './batch-certificate-transfer.dto';

export class BatchCertificateClaimDTO
    extends OmitType(BatchCertificateTransferDTO, ['to'] as const)
    implements Omit<CertificateBatchOperations.BatchCertificateClaim, 'amount' | 'schemaVersion'>
{
    @ApiProperty({ type: Object })
    @IsObject()
    claimData: IClaimData;

    @ApiPropertyOptional({
        type: String,
        description: 'Public blockchain address',
        example: '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8'
    })
    @IsEthereumAddress()
    to?: string;
}
