import { ApiProperty } from '@nestjs/swagger';
import { ContractTransaction } from 'ethers';

export class TxHashDTO {
    @ApiProperty({ type: String })
    txHash: ContractTransaction['hash'];
}
