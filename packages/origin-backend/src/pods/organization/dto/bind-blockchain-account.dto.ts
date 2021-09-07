import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class BindBlockchainAccountDTO {
    @ApiProperty({ type: String })
    @IsString()
    signedMessage: string;
}
