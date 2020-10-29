import { ApiProperty } from '@nestjs/swagger';
import { IsString, ValidateIf } from 'class-validator';

export class DelegatedTransferOptions {
    @ApiProperty({ type: String })
    @IsString()
    signature: string;

    @ApiProperty({ type: String, required: false })
    @ValidateIf((dto: DelegatedTransferOptions) => !!dto.from)
    @IsString()
    from?: string;
}
