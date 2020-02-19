import { ISmartMeterReadingsAdapter } from "../types";
import { Device, ProducingDevice } from "@energyweb/device-registry";

export class OnChainReadingsAdapter implements ISmartMeterReadingsAdapter {
    async getSmartMeterReads(device: ProducingDevice.Entity): Promise<Device.ISmartMeterRead[]> {
        return device.getSmartMeterReads();
    }
}