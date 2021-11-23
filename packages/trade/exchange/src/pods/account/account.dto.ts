import { ApiProperty } from '@nestjs/swagger';

export class AccountDTO {
    @ApiProperty({
        type: String,
        description: 'Public blockchain address',
        example: '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8'
    })
    public address: string;
}
