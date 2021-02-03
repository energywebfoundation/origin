import { DeviceVintage } from './DeviceVintage';
import { TimeRange } from './TimeRange';

export class IRECProduct {
    public deviceType?: string[];

    public location?: string[];

    public deviceVintage?: DeviceVintage;

    public generationTime?: TimeRange;

    public gridOperator?: string[];
}
