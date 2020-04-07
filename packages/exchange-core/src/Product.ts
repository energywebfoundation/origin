import { DeviceVintage } from './DeviceVintage';
import { TimeRange } from './TimeRange';

export class Product {
    public deviceType?: string[];

    public location?: string[];

    public deviceVintage?: DeviceVintage;

    public generationTime?: TimeRange;

    public gridOperator?: string[];
}
