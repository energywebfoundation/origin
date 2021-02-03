import { DemandStatus } from '@energyweb/utils-general';
import { Demand } from './exchange';

export class Demands extends Array<Demand> {
    demands: Demand[];

    constructor(demands: Demand[]) {
        super();
        this.demands = demands;
    }

    get active() {
        return this.demands ? this.demands.filter((d) => d.status !== DemandStatus.ARCHIVED) : [];
    }
}
