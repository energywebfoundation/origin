import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SmartMeterStatsDTO {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    certified: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    uncertified: string;
}
