import { ApiProperty } from '@nestjs/swagger';
import { AccountItem } from '@energyweb/issuer-irec-api-wrapper';
import { IsBoolean, IsISO31661Alpha2, IsString, ValidateNested } from 'class-validator';
import { CodeDescriptionDTO } from './code-description.dto';
import { CodeNameDTO } from './code-name.dto';

export class IrecAccountItemDto implements AccountItem {
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

    @ApiProperty({ type: CodeDescriptionDTO })
    @ValidateNested()
    fuelType: CodeDescriptionDTO;

    @ApiProperty({ type: CodeDescriptionDTO })
    @ValidateNested()
    deviceType: CodeDescriptionDTO;

    @ApiProperty({ type: CodeNameDTO })
    @ValidateNested()
    device: CodeNameDTO;

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

    @ApiProperty({ type: String })
    @IsString()
    asset: string;
}
