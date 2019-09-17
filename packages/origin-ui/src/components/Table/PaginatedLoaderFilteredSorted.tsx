import { getPropertyByPath, deepEqual } from '../../utils/Helper';
import {
    IPaginatedLoaderFilteredState,
    PaginatedLoaderFiltered,
    getInitialPaginatedLoaderFilteredState
} from './PaginatedLoaderFiltered';

export type SortPropertiesType = ReadonlyArray<
    string | readonly [string, (value: string) => number]
>;

export interface IPaginatedLoaderFilteredSortedState extends IPaginatedLoaderFilteredState {
    currentSort: SortPropertiesType;
    sortAscending: boolean;
}

export type IPaginatedLoaderFilteredSortedProps = {};

export const PAGINATED_LOADER_FILTERED_SORTED_INITIAL_STATE: IPaginatedLoaderFilteredSortedState = {
    ...getInitialPaginatedLoaderFilteredState(),
    currentSort: [],
    sortAscending: false
};

export function getInitialPaginatedLoaderFilteredSortedState(): IPaginatedLoaderFilteredSortedState {
    return JSON.parse(JSON.stringify(PAGINATED_LOADER_FILTERED_SORTED_INITIAL_STATE));
}

export abstract class PaginatedLoaderFilteredSorted<
    Props extends IPaginatedLoaderFilteredSortedProps,
    State extends IPaginatedLoaderFilteredSortedState
> extends PaginatedLoaderFiltered<Props, State> {
    constructor(props: Props) {
        super(props);

        this.toggleSort = this.toggleSort.bind(this);
    }

    sortData(records: any[]) {
        const { currentSort, sortAscending } = this.state;

        return records.sort((a, b) => {
            return currentSort
                .map(field => {
                    const direction = sortAscending ? 1 : -1;

                    let aPropertyValue;
                    let bPropertyValue;

                    if (Array.isArray(field) && field.length === 2) {
                        aPropertyValue = field[1](getPropertyByPath(a, field[0]));
                        bPropertyValue = field[1](getPropertyByPath(b, field[0]));
                    } else {
                        aPropertyValue = getPropertyByPath(a, field);
                        bPropertyValue = getPropertyByPath(b, field);
                    }

                    if (aPropertyValue > bPropertyValue) {
                        return direction;
                    }

                    if (aPropertyValue < bPropertyValue) {
                        return -direction;
                    }

                    return 0;
                })
                .reduce((previous, next) => previous || next, 0);
        });
    }

    toggleSort(sortProperties: SortPropertiesType) {
        if (deepEqual(sortProperties, this.state.currentSort)) {
            this.setState({
                sortAscending: !this.state.sortAscending
            });
        } else {
            this.setState({
                currentSort: sortProperties,
                sortAscending: true
            });
        }

        this.loadPage(1);
    }
}
