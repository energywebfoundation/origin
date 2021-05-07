import { DemandStatus } from '@energyweb/utils-general';
import { Demand } from '../types';

export class DemandList extends Array<Demand> {
  demands: Array<Demand>;

  constructor(demands: Array<Demand> = []) {
    super();
    this.demands = demands;
  }

  get active() {
    return this.demands
      ? this.demands.filter((d) => d.status !== DemandStatus.ARCHIVED)
      : [];
  }
}
