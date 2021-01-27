import { IExternalDeviceId } from '@energyweb/origin-backend-core';
import { Optional } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Trim } from 'class-sanitizer';

export class NewDeviceDTO {
    constructor(device: Partial<NewDeviceDTO>) {
        Object.assign(this, device);
    }

    @IsString()
    @Trim()
    externalRegistryId: string;

    @IsString()
    @Trim()
    smartMeterId: string;

    @IsString()
    @Trim()
    description: string;

    @IsOptional()
    @IsArray()
    externalDeviceIds?: IExternalDeviceId[];

    @Optional()
    @IsArray()
    imageIds?: string[];

    public static sanitize(device: NewDeviceDTO): NewDeviceDTO {
        return plainToClass(NewDeviceDTO, device, { excludeExtraneousValues: true });
    }
}
