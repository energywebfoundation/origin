import { RecordPropertyGetterFunction } from './FiltersHeader';
import {
    IPaginatedLoaderFilteredState,
    PaginatedLoaderFiltered,
    getInitialPaginatedLoaderFilteredState
} from './PaginatedLoaderFiltered';
import { ITableColumn } from './TableMaterial';

export type SortPropertiesType = ReadonlyArray<
    | RecordPropertyGetterFunction
    | readonly [
          RecordPropertyGetterFunction,
          (
              value: ReturnType<RecordPropertyGetterFunction>
          ) => ReturnType<RecordPropertyGetterFunction>
      ]
>;

export type CurrentSortType = {
    id: ITableColumn['id'];
    sortProperties: ITableColumn['sortProperties'];
};

export interface IPaginatedLoaderFilteredSortedState extends IPaginatedLoaderFilteredState {
    currentSort: CurrentSortType;
    sortAscending: boolean;
}

export type IPaginatedLoaderFilteredSortedProps = {};

export const PAGINATED_LOADER_FILTERED_SORTED_INITIAL_STATE: IPaginatedLoaderFilteredSortedState = {
    ...getInitialPaginatedLoaderFilteredState(),
    currentSort: null,
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
            return currentSort?.sortProperties
                ?.map(field => {
                    const direction = sortAscending ? 1 : -1;

                    let aPropertyValue;
                    let bPropertyValue;

                    if (typeof field === 'function') {
                        aPropertyValue = field(a);
                        bPropertyValue = field(b);
                    } else if (field.length === 2) {
                        aPropertyValue = field[1](field[0](a));
                        bPropertyValue = field[1](field[0](b));
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

    toggleSort(column: CurrentSortType) {
        if (column.id === this.state.currentSort.id) {
            this.setState({
                sortAscending: !this.state.sortAscending
            });
        } else {
            this.setState({
                currentSort: column,
                sortAscending: true
            });
        }

        this.loadPage(1);
    }
}
