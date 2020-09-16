// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from '@jest/globals';
import { TimeFrame } from '@energyweb/utils-general';
import moment from 'moment';

import { CreateDemandDTO } from './create-demand.dto';
import { DemandTimePeriodService } from './demand-time-period.service';

describe('DemandTimePeriodService', () => {
    const demandTimePeriod = new DemandTimePeriodService();
    const mockCreateDemandDTO: CreateDemandDTO = {
        price: 100,
        volumePerPeriod: '1000',
        periodTimeFrame: TimeFrame.monthly,
        start: moment('01-2020', 'MM-YYYY').startOf('month').toDate(),
        end: moment('03-2020', 'MM-YYYY').endOf('month').toDate(),
        product: {},
        boundToGenerationTime: false,
        excludeEnd: true
    };

    it('should create two orders on excludeEnd set to true', () => {
        const actual = demandTimePeriod.generateValidityDates(mockCreateDemandDTO);
        expect(actual).toHaveLength(2);
    });

    it('should create three orders on excludeEnd set to false', () => {
        const actual = demandTimePeriod.generateValidityDates({
            ...mockCreateDemandDTO,
            excludeEnd: false
        });
        expect(actual).toHaveLength(3);
    });
});
