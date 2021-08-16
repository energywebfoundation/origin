import { ApiProperty } from '@nestjs/swagger';

export class CertificateEvent {
    @ApiProperty()
    name: string;

    @ApiProperty()
    timestamp: number;

    @ApiProperty()
    values?: any;
}

export interface IssuerModuleOptions {
    enableTransactionLogging: boolean;
}
