import { PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, Validate } from 'class-validator';

import { ETHAddressValidator } from '../../utils/ethAddressValidator';

export class RequestWithdrawalDTO {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsUUID()
    public readonly assetId: string;

    @ApiProperty({ type: String })
    @Validate(ETHAddressValidator)
    public readonly address: string;

    @ApiProperty({ type: String })
    @Validate(PositiveBNStringValidator)
    public readonly amount: string;
}
