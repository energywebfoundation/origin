import { ApiProperty } from "@nestjs/swagger";
import { NewDeviceDTO } from "./new-device.dto";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class DeviceDTO extends NewDeviceDTO {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsUUID()
    id: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    owner: string;
}