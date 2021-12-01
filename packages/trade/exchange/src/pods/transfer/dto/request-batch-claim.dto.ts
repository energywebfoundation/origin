import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { ClaimDataDTO } from './claim-data.dto';

export class RequestBatchClaimDTO {
    @ApiProperty({ type: [String] })
    @IsNotEmpty()
    @IsUUID('all', { each: true })
    public readonly assetIds: string[];

    @ApiProperty({ type: ClaimDataDTO })
    @IsNotEmpty()
    claimData: ClaimDataDTO;
}
