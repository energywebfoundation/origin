import { plainToClass } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Trim } from 'class-sanitizer';
import { ApiProperty } from '@nestjs/swagger';
import { ExternalDeviceIdDTO } from './external-device-id.dto';

export class NewDeviceDTO {
    constructor(device: Partial<NewDeviceDTO>) {
        Object.assign(this, device);
    }

    @ApiProperty({ type: String })
    @IsString()
    @Trim()
    externalRegistryId: string;

    @ApiProperty({ type: String })
    @IsString()
    @Trim()
    smartMeterId: string;

    @ApiProperty({ type: String })
    @IsString()
    @Trim()
    description: string;

    @ApiProperty({ type: [ExternalDeviceIdDTO], required: false })
    @IsOptional()
    @IsArray()
    externalDeviceIds?: ExternalDeviceIdDTO[];

    @ApiProperty({ type: [String], required: false })
    @IsOptional()
    @IsArray()
    imageIds?: string[];

    public static sanitize(device: NewDeviceDTO): NewDeviceDTO {
        return plainToClass(NewDeviceDTO, device);
    }
}
