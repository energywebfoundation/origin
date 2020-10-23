import { ApiProperty } from '@nestjs/swagger';

export class IssueCertificateDTO {
    @ApiProperty()
    to: string;

    @ApiProperty()
    energy: string;

    @ApiProperty()
    fromTime: number;

    @ApiProperty()
    toTime: number;

    @ApiProperty()
    deviceId: string;

    @ApiProperty({ required: false })
    isPrivate?: boolean;
}
