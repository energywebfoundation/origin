import {
    PaginatedLoaderFilteredSorted,
    IPaginatedLoaderFilteredSortedState,
    IPaginatedLoaderFilteredSortedProps,
    getInitialPaginatedLoaderFilteredSortedState,
    SortPropertiesType
} from '../../components/Table/PaginatedLoaderFilteredSorted';
import { IPaginatedLoaderFetchDataReturnValues } from '../../components/Table/PaginatedLoader';

describe('PaginatedLoaderFilteredSorted', () => {
    it('sortData correctly sorts records by multiple properties', async () => {
        class TestClass extends PaginatedLoaderFilteredSorted<
            IPaginatedLoaderFilteredSortedProps,
            IPaginatedLoaderFilteredSortedState
        > {
            constructor(props: any) {
                super(props);

                this.state = {
                    ...getInitialPaginatedLoaderFilteredSortedState(),
                    currentSort: null,
                    sortAscending: false
                };
            }

            getPaginatedData(): Promise<IPaginatedLoaderFetchDataReturnValues> {
                throw new Error('Method not implemented.');
            }
        }

        const paginationFilteredLoader = new TestClass({});

        const DEVICES = {
            BERLIN: {
                producingDevice: {
                    offChainProperties: {
                        country: 'Germany',
                        city: 'Berlin'
                    }
                }
            },
            ANG_THONG: {
                producingDevice: {
                    offChainProperties: {
                        country: 'Thailand',
                        city: 'Ang Thong'
                    }
                }
            },
            BANGKOK: {
                producingDevice: {
                    offChainProperties: {
                        country: 'Thailand',
                        city: 'Bangkok'
                    }
                }
            }
        };

        const records = [DEVICES.BERLIN, DEVICES.BANGKOK, DEVICES.ANG_THONG];

        type RecordType = typeof records[0];
        const countryCityColumn = {
            id: 'countryCity',
            label: '',
            sortProperties: [
                (record: RecordType) => record.producingDevice.offChainProperties.country,
                (record: RecordType) => record.producingDevice.offChainProperties.city
            ]
        };

        paginationFilteredLoader.state = {
            ...getInitialPaginatedLoaderFilteredSortedState(),
            currentSort: countryCityColumn,
            sortAscending: true
        };

        expect(paginationFilteredLoader.sortData(records)).toEqual([
            DEVICES.BERLIN,
            DEVICES.ANG_THONG,
            DEVICES.BANGKOK
        ]);

        paginationFilteredLoader.state = {
            ...getInitialPaginatedLoaderFilteredSortedState(),
            currentSort: countryCityColumn,
            sortAscending: false
        };

        expect(paginationFilteredLoader.sortData(records)).toEqual([
            DEVICES.BANGKOK,
            DEVICES.ANG_THONG,
            DEVICES.BERLIN
        ]);
    });

    it('sorts data correctly when passing function to be run primer on data', async () => {
        class TestClass extends PaginatedLoaderFilteredSorted<
            IPaginatedLoaderFilteredSortedProps,
            IPaginatedLoaderFilteredSortedState
        > {
            constructor(props: any) {
                super(props);

                this.state = {
                    ...getInitialPaginatedLoaderFilteredSortedState(),
                    currentSort: null,
                    sortAscending: false
                };
            }

            getPaginatedData(): Promise<IPaginatedLoaderFetchDataReturnValues> {
                throw new Error('Method not implemented.');
            }
        }

        const paginationFilteredLoader = new TestClass({});

        const records = [
            {
                energy: 1000
            },
            {
                energy: 21
            },
            {
                energy: 209
            }
        ];

        type RecordType = typeof records[0];

        const energyColumn = {
            id: 'energy',
            label: '',
            sortProperties: [
                [
                    (record: RecordType) => record.energy,
                    (value: string | number): string | number => parseInt(value.toString(), 10)
                ]
            ] as SortPropertiesType
        };

        paginationFilteredLoader.state = {
            ...getInitialPaginatedLoaderFilteredSortedState(),
            currentSort: energyColumn,
            sortAscending: true
        };

        expect(paginationFilteredLoader.sortData(records)).toEqual([
            {
                energy: 21
            },
            {
                energy: 209
            },
            {
                energy: 1000
            }
        ]);

        paginationFilteredLoader.state = {
            ...getInitialPaginatedLoaderFilteredSortedState(),
            currentSort: energyColumn,
            sortAscending: false
        };

        expect(paginationFilteredLoader.sortData(records)).toEqual([
            {
                energy: 1000
            },
            {
                energy: 209
            },
            {
                energy: 21
            }
        ]);
    });
});
