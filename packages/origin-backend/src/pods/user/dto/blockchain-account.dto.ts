import { BlockchainAccountType, IBlockchainAccount } from '@energyweb/origin-backend-core';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class BlockchainAccountDTO implements IBlockchainAccount {
    @ApiProperty({ type: String })
    @IsString()
    address: string;

    @ApiProperty({ enum: BlockchainAccountType, enumName: 'BlockchainAccountType' })
    @IsEnum(BlockchainAccountType)
    type: BlockchainAccountType;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    signedMessage?: string;
}
