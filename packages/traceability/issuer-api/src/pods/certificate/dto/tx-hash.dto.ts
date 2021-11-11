import { ApiProperty } from '@nestjs/swagger';
import { ContractTransaction } from 'ethers';

export class TxHashDTO {
    @ApiProperty({
        type: String,
        example: '0x2b8da531e46cff1e217abc113495befac9384339feb10816b0f7f2ffa02fadd4'
    })
    txHash: ContractTransaction['hash'];
}
