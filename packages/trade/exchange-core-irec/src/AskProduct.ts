import { IMatchableProduct } from '@energyweb/exchange-core';
import { IDeviceTypeService, ILocationService } from '@energyweb/utils-general';
import * as Moment from 'moment';
import { extendMoment } from 'moment-range';

import { IRECProduct } from './IRECProduct';
import { Filter, IRECProductFilter } from './IRECProductFilter';

const moment = extendMoment(Moment);

export class AskProduct implements IMatchableProduct<IRECProduct, IRECProductFilter> {
    constructor(
        public readonly product: Partial<IRECProduct>,
        private readonly deviceService: IDeviceTypeService,
        private readonly locationService: ILocationService
    ) {
        if (product.deviceType?.length !== 1) {
            throw new Error('Unable to create ask order. DeviceType has to be specified');
        }
        if (!product.generationTime) {
            throw new Error(
                'Unable to create ask order. GenerationTime has to be specified as single TimeRange'
            );
        }
        if (product.gridOperator && product.gridOperator.length > 1) {
            throw new Error('Unable to create ask order. GridOperator has to be not set or 1');
        }
    }

    private get deviceType() {
        return this.product.deviceType[0];
    }

    private get location() {
        return this.product.location[0];
    }

    filter(productFilter: IRECProductFilter): boolean {
        const hasMatchingDeviceType = this.filterByDeviceType(productFilter);
        const hasMatchingVintage = this.filterByDeviceVintage(productFilter);
        const hasMatchingLocation = this.filterByLocation(productFilter);
        const hasMatchingGenerationTime = this.filterByGenerationTime(productFilter);
        const hasMatchingGridOperator = this.filterByGridOperator(productFilter);

        return (
            hasMatchingDeviceType &&
            hasMatchingVintage &&
            hasMatchingLocation &&
            hasMatchingGenerationTime &&
            hasMatchingGridOperator
        );
    }

    public matches(product: IRECProduct): boolean {
        const hasMatchingDeviceType = this.hasMatchingDeviceType(product);
        const hasMatchingVintage = this.hasMatchingVintage(product);
        const hasMatchingLocation = this.hasMatchingLocation(product);
        const hasMatchingGenerationTime = this.hasMatchingGenerationTime(product);
        const hasMatchingGridOperator = this.hasMatchingGridOperator(product);

        return (
            hasMatchingDeviceType &&
            hasMatchingVintage &&
            hasMatchingLocation &&
            hasMatchingGenerationTime &&
            hasMatchingGridOperator
        );
    }

    private applyFilter(filter: Filter, pred: () => boolean) {
        if (filter === Filter.All || filter === Filter.Unspecified) {
            return true;
        }

        return pred();
    }

    private filterByDeviceType(productFilter: IRECProductFilter) {
        return this.applyFilter(productFilter.deviceTypeFilter, () =>
            this.deviceService.includesDeviceType(this.deviceType, productFilter.deviceType)
        );
    }

    private filterByLocation(productFilter: IRECProductFilter) {
        return this.applyFilter(productFilter.locationFilter, () =>
            this.locationService.matches(productFilter.location, this.location)
        );
    }

    private filterByDeviceVintage(productFilter: IRECProductFilter) {
        return this.applyFilter(productFilter.deviceVintageFilter, () =>
            this.product.deviceVintage.matches(productFilter.deviceVintage)
        );
    }

    private filterByGenerationTime(productFilter: IRECProductFilter) {
        return this.applyFilter(productFilter.generationTimeFilter, () =>
            this.matchesGenerationTimes(productFilter)
        );
    }

    private filterByGridOperator(productFilter: IRECProductFilter) {
        return this.applyFilter(productFilter.gridOperatorFilter, () =>
            productFilter.gridOperator.some(
                (bidGridOperator) => bidGridOperator === this.product.gridOperator[0]
            )
        );
    }

    private hasMatchingDeviceType(product: IRECProduct) {
        if (!product.deviceType?.length) {
            return true;
        }

        return this.deviceService.includesDeviceType(this.deviceType, product.deviceType);
    }

    private hasMatchingVintage(product: IRECProduct) {
        if (!product.deviceVintage || !this.product.deviceVintage) {
            return true;
        }
        return this.product.deviceVintage.matches(product.deviceVintage);
    }

    private hasMatchingLocation(product: IRECProduct) {
        if (!product.location?.length) {
            return true;
        }

        return this.locationService.matches(product.location, this.location);
    }

    private hasMatchingGenerationTime(product: IRECProduct) {
        if (!product.generationTime) {
            return true;
        }

        return this.matchesGenerationTimes(product);
    }

    private hasMatchingGridOperator(product: IRECProduct) {
        if (!this.product.gridOperator?.length || !product.gridOperator?.length) {
            return true;
        }

        return product.gridOperator.some(
            (bidGridOperator) => bidGridOperator === this.product.gridOperator[0]
        );
    }

    private matchesGenerationTimes(product: IRECProduct) {
        const range = moment.range(
            this.product.generationTime.from,
            this.product.generationTime.to
        );
        const askRange = moment.range(product.generationTime.from, product.generationTime.to);

        return range.contains(askRange);
    }
}
