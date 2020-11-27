import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateBlockchainAddressDTO {
    @ApiProperty({ type: String })
    @IsString()
    blockchainAccountAddress: string;
}
