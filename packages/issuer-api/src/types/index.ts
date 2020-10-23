import { ApiProperty } from '@nestjs/swagger';

export class ICertificateEvent {
    @ApiProperty()
    name: string;

    @ApiProperty()
    timestamp: number;

    @ApiProperty()
    values?: any;
}
