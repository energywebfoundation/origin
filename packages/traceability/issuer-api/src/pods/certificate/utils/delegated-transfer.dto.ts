import { ApiProperty } from '@nestjs/swagger';
import { IsString, ValidateIf, IsEthereumAddress } from 'class-validator';

export class DelegatedTransferOptions {
    @ApiProperty({
        type: String,
        example:
            '0xf86c0a8502540be400825208944bbeeb066ed09b7aed07bf39eee0460dfa261520880de0b6b3a7640000801ca0f3ae52c1ef3300f44df0bcfd1341c232ed6134672b16e35699ae3f5fe2493379a023d23d2955a239dd6f61c4e8b2678d174356ff424eac53da53e17706c43ef871'
    })
    @IsString()
    signature: string;

    @ApiProperty({
        type: String,
        required: false,
        description: 'Public blockchain address',
        example: '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8'
    })
    @ValidateIf((dto: DelegatedTransferOptions) => !!dto.from)
    @IsEthereumAddress()
    from?: string;
}
