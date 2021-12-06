import { PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, Validate } from 'class-validator';

import { ETHAddressValidator } from '../../../utils/ethAddressValidator';

export class RequestWithdrawalDTO {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsUUID()
    public readonly assetId: string;

    @ApiProperty({
        type: String,
        description: 'Public blockchain address',
        example: '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8'
    })
    @Validate(ETHAddressValidator)
    public readonly address: string;

    @ApiProperty({ type: String, example: '500' })
    @Validate(PositiveBNStringValidator)
    public readonly amount: string;
}
