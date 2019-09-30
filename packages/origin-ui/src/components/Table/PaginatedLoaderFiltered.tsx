import { ICustomFilter, CustomFilterInputType } from './FiltersHeader';
import {
    PaginatedLoader,
    IPaginatedLoaderState,
    getInitialPaginatedLoaderState,
    IPaginatedLoader
} from './PaginatedLoader';
import { getPropertyByPath, indexOfEnd } from '../../utils/Helper';
import moment, { Moment } from 'moment';
import { IRECAssetService } from '@energyweb/utils-general';

export type IPaginatedLoaderFilteredProps = {};

export interface IPaginatedLoaderFilteredState extends IPaginatedLoaderState {
    appliedFilters: ICustomFilter[];
}

export const PAGINATED_LOADER_FILTERED_INITIAL_STATE: IPaginatedLoaderFilteredState = {
    ...getInitialPaginatedLoaderState(),
    appliedFilters: []
};

export function getInitialPaginatedLoaderFilteredState(): IPaginatedLoaderFilteredState {
    return JSON.parse(JSON.stringify(PAGINATED_LOADER_FILTERED_INITIAL_STATE));
}

export enum FILTER_SPECIAL_TYPES {
    COMBINE = 'FILTER_COMBINE',
    DATE_YEAR = 'FILTER_DATE_YEAR',
    DIVIDE = 'FILTER_DIVIDE',
    SPLIT_INCLUDES = 'SPLIT_INCLUDES'
}

export const RECORD_INDICATOR = 'RECORD|';
const FILTER_PROPERTY_SEPARATOR = '::';

function getIndividualPropertyFilterValue(record: any, property: string) {
    const recordSignIndex = indexOfEnd(property, RECORD_INDICATOR);

    if (recordSignIndex === -1) {
        return property;
    }

    const recordPropertyName = property.slice(recordSignIndex, property.length);

    return getPropertyByPath(record, recordPropertyName);
}

const FILTER_PROPERTY_PROCESSING_FUNCTIONS = {
    [FILTER_SPECIAL_TYPES.COMBINE](record: any, ...properties: string[]) {
        return properties
            .map(property => getIndividualPropertyFilterValue(record, property))
            .join('');
    },
    [FILTER_SPECIAL_TYPES.DATE_YEAR](record: any, property: string) {
        return moment.unix(parseInt(getIndividualPropertyFilterValue(record, property), 10)).year();
    },
    [FILTER_SPECIAL_TYPES.DIVIDE](record: any, ...properties: string[]) {
        return properties
            .map(property => getIndividualPropertyFilterValue(record, property))
            .reduce((a, b, index) => (index === 0 ? a : a / b));
    }
};

function parseFilter(record: any, property: string) {
    if (property.indexOf(FILTER_PROPERTY_SEPARATOR) === -1) {
        return getIndividualPropertyFilterValue(record, property);
    }

    const splitString = property.split(FILTER_PROPERTY_SEPARATOR);

    for (const specialFilterKey of Object.keys(FILTER_SPECIAL_TYPES)) {
        const specialFilter = FILTER_SPECIAL_TYPES[specialFilterKey];

        if (splitString[0] === specialFilter) {
            return FILTER_PROPERTY_PROCESSING_FUNCTIONS[specialFilter](
                record,
                ...splitString.slice(1, splitString.length)
            );
        }
    }

    return property;
}

export abstract class PaginatedLoaderFiltered<
    Props extends IPaginatedLoaderFilteredProps,
    State extends IPaginatedLoaderFilteredState
> extends PaginatedLoader<Props, State> implements IPaginatedLoader {
    protected assetTypeService = new IRECAssetService();

    async loadPage(page: number, filters?: ICustomFilter[]) {
        const { appliedFilters } = this.state;

        if (filters) {
            this.setState({
                appliedFilters: filters
            });
        } else if (appliedFilters) {
            filters = appliedFilters;
        }

        await super.loadPage(page, filters);
    }

    checkRecordPassesFilters(record: any, filters: ICustomFilter[]): boolean {
        if (!filters) {
            return true;
        }

        for (const filter of filters) {
            const filteredPropertyResolvedValue = parseFilter(record, filter.property);

            if (typeof filteredPropertyResolvedValue !== 'undefined') {
                switch (filter.input.type) {
                    case CustomFilterInputType.string:
                        if (
                            filter.selectedValue &&
                            !filteredPropertyResolvedValue
                                .toString()
                                .toLowerCase()
                                .includes(filter.selectedValue.toLowerCase())
                        ) {
                            return false;
                        }
                        break;
                    case CustomFilterInputType.multiselect:
                        return filter.selectedValue.includes(filteredPropertyResolvedValue);
                    case CustomFilterInputType.assetType:
                        if (
                            filter.selectedValue &&
                            filter.selectedValue.length !== 0 &&
                            !this.assetTypeService.includesAssetType(
                                filteredPropertyResolvedValue as string,
                                filter.selectedValue as string[]
                            )
                        ) {
                            return false;
                        }
                        break;
                    case CustomFilterInputType.dropdown:
                        if (
                            filter.selectedValue &&
                            filter.selectedValue.toString() !==
                                filteredPropertyResolvedValue.toString()
                        ) {
                            return false;
                        }
                        break;
                    case CustomFilterInputType.slider:
                        if (filter.selectedValue) {
                            const [min, max] = filter.selectedValue as number[];

                            if (
                                filteredPropertyResolvedValue < min ||
                                filteredPropertyResolvedValue > max
                            ) {
                                return false;
                            }
                        }
                        break;
                    case CustomFilterInputType.yearMonth:
                        if (filter.selectedValue) {
                            const year = (filter.selectedValue as Moment).year();
                            const month = (filter.selectedValue as Moment).month();

                            const recordDate = moment.unix(filteredPropertyResolvedValue);

                            if (recordDate.month() !== month || recordDate.year() !== year) {
                                return false;
                            }
                        }
                        break;
                }
            }
        }

        return true;
    }
}
