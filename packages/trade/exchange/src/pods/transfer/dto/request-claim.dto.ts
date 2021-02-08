import { PickType } from '@nestjs/swagger';
import { RequestWithdrawalDTO } from './create-withdrawal.dto';

export class RequestClaimDTO extends PickType(RequestWithdrawalDTO, [
    'assetId',
    'amount'
] as const) {}
