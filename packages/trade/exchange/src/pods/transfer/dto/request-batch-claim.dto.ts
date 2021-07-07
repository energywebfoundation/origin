import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class RequestBatchClaimDTO {
    @ApiProperty({ type: [String] })
    @IsNotEmpty()
    @IsUUID('all', { each: true })
    public readonly assetIds: string[];
}
