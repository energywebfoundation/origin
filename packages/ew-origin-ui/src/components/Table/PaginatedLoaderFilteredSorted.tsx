import { getPropertyByPath, deepEqual } from '../../utils/Helper';
import { IPaginatedLoaderFilteredState, PaginatedLoaderFiltered, getInitialPaginatedLoaderFilteredState } from './PaginatedLoaderFiltered';

export interface IPaginatedLoaderFilteredSortedState extends IPaginatedLoaderFilteredState {
    currentSort: string[];
    sortAscending: boolean;
}

export type IPaginatedLoaderFilteredSortedProps = any;

export const PAGINATED_LOADER_FILTERED_SORTED_INITIAL_STATE: IPaginatedLoaderFilteredSortedState = {
    ...getInitialPaginatedLoaderFilteredState(),
    currentSort: [],
    sortAscending: false
};

export function getInitialPaginatedLoaderFilteredSortedState(): IPaginatedLoaderFilteredSortedState {
    return JSON.parse(JSON.stringify(PAGINATED_LOADER_FILTERED_SORTED_INITIAL_STATE));
}

export abstract class PaginatedLoaderFilteredSorted<Props extends IPaginatedLoaderFilteredSortedProps, State extends IPaginatedLoaderFilteredSortedState> extends PaginatedLoaderFiltered<Props, State> {
    constructor(props: Props) {
        super(props);

        this.toggleSort = this.toggleSort.bind(this);
    }

    sortData(records: any) {
        const {
            currentSort,
            sortAscending
        } = this.state;

        return records.sort((a, b) => {
            return currentSort.map(field => {
                const direction = sortAscending ? 1 : -1;

                const aPropertyValue = getPropertyByPath(a, field);
                const bPropertyValue = getPropertyByPath(b, field);

                if (aPropertyValue > bPropertyValue) {
                    return direction;
                }

                if (aPropertyValue < bPropertyValue) {
                    return -direction;
                }

                return 0;
            }).reduce((a, b) => a ? a : b, 0);
        });
    }

    toggleSort(sortProperties: string[]) {
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
