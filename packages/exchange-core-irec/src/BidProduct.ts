import { IMatchableProduct } from '@energyweb/exchange-core';
import { IDeviceTypeService, ILocationService } from '@energyweb/utils-general';
import * as Moment from 'moment';
import { extendMoment } from 'moment-range';

import { IRECProduct } from './IRECProduct';
import { Filter, IRECProductFilter } from './IRECProductFilter';

const moment = extendMoment(Moment);

export class BidProduct implements IMatchableProduct<IRECProduct, IRECProductFilter> {
    constructor(
        public readonly product: Partial<IRECProduct>,
        private readonly deviceService: IDeviceTypeService,
        private readonly locationService: ILocationService
    ) {}

    matches(product: IRECProduct): boolean {
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

    filter(productFilter: IRECProductFilter): boolean {
        const isIncludedInDeviceType = this.isIncludedInDeviceType(productFilter);
        const hasMatchingVintage = this.filterByDeviceVintage(productFilter);
        const isIncludedInLocation = this.isIncludedInLocation(productFilter);
        const hasMatchingGenerationTime = this.filterByGenerationTime(productFilter);
        const hasMatchingGridOperator = this.filterByGridOperator(productFilter);

        return (
            isIncludedInDeviceType &&
            hasMatchingVintage &&
            isIncludedInLocation &&
            hasMatchingGenerationTime &&
            hasMatchingGridOperator
        );
    }

    private hasMatchingDeviceType(product: IRECProduct) {
        if (!this.product.deviceType?.length || !product.deviceType?.length) {
            return true;
        }

        return this.deviceService.includesDeviceType(
            product.deviceType[0],
            this.product.deviceType
        );
    }

    private hasMatchingLocation(product: IRECProduct) {
        if (!this.product.location?.length || !product.location?.length) {
            return true;
        }

        return this.locationService.matches(this.product.location, product.location[0]);
    }

    private isIncludedInLocation(productFilter: IRECProductFilter) {
        if (productFilter.locationFilter === Filter.All) {
            return true;
        }
        if (productFilter.locationFilter === Filter.Unspecified) {
            return !this.product.location?.length;
        }

        if (!this.product.location?.length) {
            return false;
        }

        return (
            this.locationService.matchesSome(productFilter.location, this.product.location) ||
            this.locationService.matchesSome(this.product.location, productFilter.location)
        );
    }

    private isIncludedInDeviceType(productFilter: IRECProductFilter) {
        if (productFilter.deviceTypeFilter === Filter.All) {
            return true;
        }
        if (productFilter.deviceTypeFilter === Filter.Unspecified) {
            return !this.product.deviceType?.length;
        }

        if (!this.product.deviceType?.length) {
            return false;
        }

        return (
            this.deviceService.includesSomeDeviceType(
                productFilter.deviceType,
                this.product.deviceType
            ) ||
            this.deviceService.includesSomeDeviceType(
                this.product.deviceType,
                productFilter.deviceType
            )
        );
    }

    private filterByDeviceVintage(productFilter: IRECProductFilter) {
        if (productFilter.deviceVintageFilter === Filter.All) {
            return true;
        }
        if (productFilter.deviceVintageFilter === Filter.Unspecified) {
            return !this.product.deviceVintage;
        }

        if (!this.product.deviceVintage) {
            return false;
        }

        return productFilter.deviceVintage.matches(this.product.deviceVintage);
    }

    private filterByGenerationTime(productFilter: IRECProductFilter) {
        if (productFilter.generationTimeFilter === Filter.All) {
            return true;
        }
        if (productFilter.generationTimeFilter === Filter.Unspecified) {
            return !this.product.generationTime;
        }

        if (!this.product.generationTime) {
            return false;
        }

        return this.matchesGenerationTimes(productFilter);
    }

    private filterByGridOperator(productFilter: IRECProductFilter) {
        if (productFilter.gridOperatorFilter === Filter.All) {
            return true;
        }
        if (productFilter.gridOperatorFilter === Filter.Unspecified) {
            return !this.product.gridOperator?.length;
        }

        if (!this.product.gridOperator?.length) {
            return false;
        }

        return this.product.gridOperator.some((bidGridOperator) =>
            productFilter.gridOperator.some((gridOperator) => gridOperator === bidGridOperator)
        );
    }

    private hasMatchingVintage(product: IRECProduct) {
        if (!this.product.deviceVintage || !product.deviceVintage) {
            return true;
        }
        return product.deviceVintage.matches(this.product.deviceVintage);
    }

    private hasMatchingGenerationTime(product: IRECProduct) {
        if (!this.product.generationTime) {
            return true;
        }

        return this.matchesGenerationTimes(product);
    }

    private hasMatchingGridOperator(product: IRECProduct) {
        if (!this.product.gridOperator?.length || !product.gridOperator?.length) {
            return true;
        }

        return this.product.gridOperator.some(
            (bidGridOperator) => bidGridOperator === product.gridOperator[0]
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
