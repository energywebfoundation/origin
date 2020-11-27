import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateOwnUserDTO {
    @ApiProperty({ type: String, required: false })
    @IsString()
    firstName?: string;

    @ApiProperty({ type: String, required: false })
    @IsString()
    lastName?: string;

    @ApiProperty({ type: String, required: false })
    @IsString()
    email?: string;

    @ApiProperty({ type: String, required: false })
    @IsString()
    telephone?: string;

    @ApiProperty({ type: String, required: false })
    @IsString()
    blockchainAccountAddress?: string;
}
