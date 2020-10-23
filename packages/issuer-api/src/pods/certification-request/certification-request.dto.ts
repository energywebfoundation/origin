import { ApiProperty } from '@nestjs/swagger';

export class ICertificationRequestDTO {
    @ApiProperty()
    id: number;

    @ApiProperty()
    deviceId: string;

    @ApiProperty()
    energy: string;

    @ApiProperty()
    owner: string;

    @ApiProperty()
    fromTime: number;

    @ApiProperty()
    toTime: number;

    @ApiProperty()
    files: string[];

    @ApiProperty()
    created: number;

    @ApiProperty()
    approved: boolean;

    @ApiProperty()
    revoked: boolean;

    @ApiProperty()
    requestId?: number;

    @ApiProperty()
    approvedDate?: Date;

    @ApiProperty()
    revokedDate?: Date;

    @ApiProperty()
    issuedCertificateTokenId?: number;
}
