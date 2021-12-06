import { ApiProperty, PickType } from '@nestjs/swagger';
import { RequestWithdrawalDTO } from './create-withdrawal.dto';
import { ClaimDataDTO } from './claim-data.dto';
import { IsNotEmpty } from 'class-validator';

export class RequestClaimDTO extends PickType(RequestWithdrawalDTO, [
    'assetId',
    'amount'
] as const) {
    @ApiProperty({ type: ClaimDataDTO })
    @IsNotEmpty()
    claimData: ClaimDataDTO;
}
