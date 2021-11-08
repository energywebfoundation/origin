import { ApiProperty } from '@nestjs/swagger';
import { ContractTransaction } from 'ethers';

export class TxHashDTO {
    @ApiProperty({ type: String, example: "x99999999"})
    txHash: ContractTransaction['hash'];
}
