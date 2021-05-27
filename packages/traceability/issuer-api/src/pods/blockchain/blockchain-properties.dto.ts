import { ApiProperty } from '@nestjs/swagger';

export class BlockchainPropertiesDTO {
    @ApiProperty({ type: Number })
    netId: number;

    @ApiProperty({ type: String })
    registry: string;

    @ApiProperty({ type: String })
    issuer: string;

    @ApiProperty({ type: String })
    rpcNode: string;

    @ApiProperty({ type: String, required: false })
    rpcNodeFallback?: string;

    @ApiProperty({ type: String, required: false })
    privateIssuer?: string;
}
