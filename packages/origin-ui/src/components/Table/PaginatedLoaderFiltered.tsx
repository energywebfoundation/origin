import { ICustomFilter, CustomFilterInputType } from './FiltersHeader';
import {
    PaginatedLoader,
    IPaginatedLoaderState,
    getInitialPaginatedLoaderState,
    IPaginatedLoader
} from './PaginatedLoader';
import moment, { Moment } from 'moment';
import { IRECDeviceService } from '@energyweb/utils-general';
import { clone } from '../../utils/helper';

export type IPaginatedLoaderFilteredProps = {};

export interface IPaginatedLoaderFilteredState extends IPaginatedLoaderState {
    appliedFilters: ICustomFilter[];
}

export const PAGINATED_LOADER_FILTERED_INITIAL_STATE: IPaginatedLoaderFilteredState = {
    ...getInitialPaginatedLoaderState(),
    appliedFilters: []
};

export function getInitialPaginatedLoaderFilteredState(): IPaginatedLoaderFilteredState {
    return clone(PAGINATED_LOADER_FILTERED_INITIAL_STATE);
}

export abstract class PaginatedLoaderFiltered<
    Props extends IPaginatedLoaderFilteredProps,
    State extends IPaginatedLoaderFilteredState
> extends PaginatedLoader<Props, State> implements IPaginatedLoader {
    protected deviceTypeService = new IRECDeviceService();

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
            const filteredPropertyResolvedValue = filter.property(record);

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
                    case CustomFilterInputType.deviceType:
                        if (
                            filter.selectedValue &&
                            filter.selectedValue.length !== 0 &&
                            !this.deviceTypeService.includesDeviceType(
                                filteredPropertyResolvedValue?.toString(),
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

                            const valueAsNumber =
                                typeof filteredPropertyResolvedValue === 'number'
                                    ? filteredPropertyResolvedValue
                                    : parseInt(filteredPropertyResolvedValue.toString(), 10);

                            if (valueAsNumber < min || valueAsNumber > max) {
                                return false;
                            }
                        }
                        break;
                    case CustomFilterInputType.yearMonth:
                        if (filter.selectedValue) {
                            const year = (filter.selectedValue as Moment).year();
                            const month = (filter.selectedValue as Moment).month();

                            const recordDate = moment.unix(
                                parseInt(filteredPropertyResolvedValue?.toString(), 10)
                            );

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
