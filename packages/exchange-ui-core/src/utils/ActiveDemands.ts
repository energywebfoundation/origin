import { DemandStatus } from '@energyweb/utils-general';
import { Demand } from './exchange';

export class ActiveDemands extends Array<Demand> {
    demands: Demand[];

    constructor(demands: Demand[]) {
        super();
        this.demands = demands ? demands.filter((d) => d.status !== DemandStatus.ARCHIVED) : [];
    }
}
