import { ApiProperty, PickType, ApiPropertyOptional } from '@nestjs/swagger';
import { RequestWithdrawalDTO } from './create-withdrawal.dto';
import { ClaimDataDTO } from './claim-data.dto';
import { IsEthereumAddress, IsNotEmpty, IsOptional } from 'class-validator';

export class RequestClaimDTO extends PickType(RequestWithdrawalDTO, [
    'assetId',
    'amount'
] as const) {
    @ApiProperty({ type: ClaimDataDTO })
    @IsNotEmpty()
    claimData: ClaimDataDTO;

    @ApiPropertyOptional({
        type: String,
        description: 'Blockchain address to claim to',
        example: '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8'
    })
    @IsOptional()
    @IsEthereumAddress()
    claimAddress?: string;
}
