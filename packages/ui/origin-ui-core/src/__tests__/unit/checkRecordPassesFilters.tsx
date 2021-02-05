import { DeviceTypeService } from '@energyweb/utils-general';

import {
    checkRecordPassesFilters,
    CustomFilterInputType,
    ICustomFilter
} from '../../components/Table';
import { TEST_DEVICE_TYPES } from '../utils/helpers';

describe('checkRecordPassesFilters()', () => {
    it('works', () => {
        const deviceTypeService = new DeviceTypeService(TEST_DEVICE_TYPES);

        const record = {
            deviceType: 'Solar;Photovoltaic;Roof mounted',
            owner: 'A'
        };

        const filters: ICustomFilter[] = [
            {
                property: (r: typeof record) => r.deviceType,
                label: 'Device Type',
                input: {
                    type: CustomFilterInputType.deviceType,
                    defaultOptions: []
                },
                selectedValue: null
            },
            {
                property: (r: typeof record) => r.owner,
                label: 'Owner',
                input: {
                    type: CustomFilterInputType.string
                },
                selectedValue: null
            }
        ];

        expect(checkRecordPassesFilters(record, filters, deviceTypeService)).toBe(true);

        filters[1].selectedValue = 'B';

        expect(checkRecordPassesFilters(record, filters, deviceTypeService)).toBe(false);

        filters[1].selectedValue = 'A';

        expect(checkRecordPassesFilters(record, filters, deviceTypeService)).toBe(true);

        filters[0].selectedValue = ['Wind'];

        expect(checkRecordPassesFilters(record, filters, deviceTypeService)).toBe(false);

        filters[0].selectedValue = ['Solar'];

        expect(checkRecordPassesFilters(record, filters, deviceTypeService)).toBe(true);

        filters[0].selectedValue = ['Solar;Photovoltaic'];

        expect(checkRecordPassesFilters(record, filters, deviceTypeService)).toBe(true);

        filters[0].selectedValue = ['Solar;Photovoltaic;Ground mounted'];

        expect(checkRecordPassesFilters(record, filters, deviceTypeService)).toBe(false);

        filters[0].selectedValue = ['Solar;Photovoltaic;Roof mounted'];

        expect(checkRecordPassesFilters(record, filters, deviceTypeService)).toBe(true);
    });
});
