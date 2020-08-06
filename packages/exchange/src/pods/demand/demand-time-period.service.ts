import { TimeFrame } from '@energyweb/utils-general';
import { Injectable } from '@nestjs/common';
import * as Moment from 'moment';
import { extendMoment } from 'moment-range';

import { CreateDemandDTO } from './create-demand.dto';

const moment = extendMoment(Moment);

@Injectable()
export class DemandTimePeriodService {
    public generateValidityDates(createDemand: CreateDemandDTO) {
        let { start, end } = createDemand;

        start = new Date(start);
        end = new Date(end);

        const range = moment.range(start, end);

        const { diff, step } = this.timeFrameToTimeDiff(createDemand.periodTimeFrame);
        const validFrom = Array.from(
            range.by(diff, { step, excludeEnd: createDemand.excludeEnd ?? true })
        ).map((v) => v.toDate());

        return validFrom.map((v, i) => ({
            validFrom: v,
            generationFrom: v,
            generationTo: validFrom[i + 1] || end
        }));
    }

    private timeFrameToTimeDiff(
        timeFrame: TimeFrame
    ): { diff: Moment.unitOfTime.Diff; step?: number } {
        switch (timeFrame) {
            case TimeFrame.yearly:
                return { diff: 'year' };
            case TimeFrame.monthly:
                return { diff: 'month' };
            case TimeFrame.weekly:
                return { diff: 'week' };
            case TimeFrame.daily:
                return { diff: 'day' };
            case TimeFrame.hourly:
                return { diff: 'hour' };
            case TimeFrame.halfHourly:
                return { diff: 'minute', step: 30 };
            default:
                throw new Error('Unknown timeframe');
        }
    }
}
