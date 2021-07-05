import { ApiProperty } from '@nestjs/swagger';
import { AccountItem, CodeDescription, CodeName } from '@energyweb/issuer-irec-api-wrapper';
import { IsBoolean, IsISO31661Alpha2, IsString } from 'class-validator';

export class IrecAccountItemDto extends AccountItem {
    @ApiProperty({ type: String })
    @IsString()
    code: string;

    @ApiProperty({ type: Number })
    volume: number;

    @ApiProperty({ type: String })
    @IsString()
    startDate: string;

    @ApiProperty({ type: String })
    @IsString()
    endDate: string;

    fuelType: CodeDescription;

    deviceType: CodeDescription;

    device: CodeName;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    deviceSupported: boolean;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    tagged: boolean;

    @ApiProperty({ type: Number })
    co2Produced: number;

    @ApiProperty({ type: String })
    @IsString()
    @IsISO31661Alpha2()
    country: string;

    @ApiProperty({ type: String })
    @IsString()
    product: string;
}
