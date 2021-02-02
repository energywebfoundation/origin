import { OmitType } from '@nestjs/swagger';
import { DeviceDTO } from './device.dto';

export class PublicDeviceDTO extends OmitType(DeviceDTO, ['defaultAccount'] as const) {}
