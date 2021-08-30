import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateBlockchainAccountDTO {
    @ApiProperty({ type: String })
    @IsString()
    address: string;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @IsString()
    signedMessage?: string;
}
