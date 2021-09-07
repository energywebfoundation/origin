import { Expose, plainToClass } from 'class-transformer';
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
    @Expose()
    externalRegistryId: string;

    @ApiProperty({ type: String })
    @IsString()
    @Trim()
    @Expose()
    smartMeterId: string;

    @ApiProperty({ type: String })
    @IsString()
    @Trim()
    @Expose()
    description: string;

    @ApiProperty({ type: [ExternalDeviceIdDTO], required: false })
    @IsOptional()
    @IsArray()
    @Expose()
    externalDeviceIds?: ExternalDeviceIdDTO[];

    @ApiProperty({ type: [String], required: false })
    @IsOptional()
    @IsArray()
    @Expose()
    imageIds?: string[];

    public static sanitize(device: NewDeviceDTO): NewDeviceDTO {
        return plainToClass(NewDeviceDTO, device);
    }
}
