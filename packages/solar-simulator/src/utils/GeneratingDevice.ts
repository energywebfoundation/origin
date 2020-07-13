import { ENERGY_UNIT } from './Energy';

export interface IGeneratingDevice {
    id: string;
    maxCapacity: number;
    smartMeterPrivateKey: string;
    role: string;
    manufacturer: string;
    model: string;
    serial_number: string;
    latitude: number;
    longitude: number;
    timezone: string;
    energy_unit: ENERGY_UNIT;
}
