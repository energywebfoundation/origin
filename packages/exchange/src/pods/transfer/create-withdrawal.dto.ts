import { IsNotEmpty, IsUUID, Validate } from 'class-validator';

import { BNStringValidator } from '../../utils/bnStringValidator';
import { ETHAddressValidator } from '../../utils/ethAddressValidator';

export class RequestWithdrawalDTO {
    @IsNotEmpty()
    public readonly userId: string;

    @IsUUID()
    public readonly assetId: string;

    @Validate(ETHAddressValidator)
    public readonly address: string;

    @Validate(BNStringValidator)
    public readonly amount: string;
}
