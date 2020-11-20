/* eslint-disable @typescript-eslint/naming-convention */
import * as Winston from 'winston';
import { DeviceClient } from '@energyweb/origin-backend-client';

import { IDeviceTypeService } from '@energyweb/utils-general';

export interface Entity {
    logger: Winston.Logger;
    deviceTypeService?: IDeviceTypeService;
    deviceClient?: DeviceClient;
}
