import { PaginatedLoaderFilteredSorted, IPaginatedLoaderFilteredSortedState, IPaginatedLoaderFilteredSortedProps } from '../components/Table/PaginatedLoaderFilteredSorted';

describe('PaginatedLoaderFilteredSorted', () => {
    it('sortData correctly sorts records by multiple properties', async () => {
        class TestClass extends PaginatedLoaderFilteredSorted<IPaginatedLoaderFilteredSortedState, IPaginatedLoaderFilteredSortedProps> {
            constructor(props: any) {
                super(props);

                this.state = {
                    currentSort: [],
                    sortAscending: false
                }
            }

            getPaginatedData({ pageSize, offset, filters }: import("../components/Table/PaginatedLoader").IPaginatedLoaderFetchDataParameters): Promise<import("../components/Table/PaginatedLoader").IPaginatedLoaderFetchDataReturnValues> {
                throw new Error("Method not implemented.");
            }
        }

        const paginationFilteredLoader = new TestClass({});

        paginationFilteredLoader.state = {
            currentSort: ['producingAsset.offChainProperties.country', 'producingAsset.offChainProperties.city'],
            sortAscending: true
        };

        const records = [
            {
                producingAsset: {
                    offChainProperties: {
                        country: 'Germany',
                        city: 'Berlin'
                    }
                }
            },
            {
                producingAsset: {
                    offChainProperties: {
                        country: 'Thailand',
                        city: 'Bangkok'
                    }
                }
            },
            {
                producingAsset: {
                    offChainProperties: {
                        country: 'Thailand',
                        city: 'Ang Thong'
                    }
                }
            }
        ];

        expect(paginationFilteredLoader.sortData(records)).toEqual([
            {
                producingAsset: {
                    offChainProperties: {
                        country: 'Germany',
                        city: 'Berlin'
                    }
                }
            },
            {
                producingAsset: {
                    offChainProperties: {
                        country: 'Thailand',
                        city: 'Ang Thong'
                    }
                }
            },
            {
                producingAsset: {
                    offChainProperties: {
                        country: 'Thailand',
                        city: 'Bangkok'
                    }
                }
            }
        ]);

        paginationFilteredLoader.state = {
            currentSort: ['producingAsset.offChainProperties.country', 'producingAsset.offChainProperties.city'],
            sortAscending: false
        };

        expect(paginationFilteredLoader.sortData(records)).toEqual([
            {
                producingAsset: {
                    offChainProperties: {
                        country: 'Thailand',
                        city: 'Bangkok'
                    }
                }
            },
            {
                producingAsset: {
                    offChainProperties: {
                        country: 'Thailand',
                        city: 'Ang Thong'
                    }
                }
            },
            {
                producingAsset: {
                    offChainProperties: {
                        country: 'Germany',
                        city: 'Berlin'
                    }
                }
            }
        ]);
    });

    it('sorts data correctly when passing function to be run primer on data', async () => {
        class TestClass extends PaginatedLoaderFilteredSorted<IPaginatedLoaderFilteredSortedState, IPaginatedLoaderFilteredSortedProps> {
            constructor(props: any) {
                super(props);

                this.state = {
                    currentSort: [],
                    sortAscending: false
                }
            }

            getPaginatedData({ pageSize, offset, filters }: import("../components/Table/PaginatedLoader").IPaginatedLoaderFetchDataParameters): Promise<import("../components/Table/PaginatedLoader").IPaginatedLoaderFetchDataReturnValues> {
                throw new Error("Method not implemented.");
            }
        }

        const paginationFilteredLoader = new TestClass({});

        paginationFilteredLoader.state = {
            currentSort: [['energy', (value) => parseInt(value, 10)]],
            sortAscending: true
        };

        const records = [
            {
                energy: '1000'
            },
            {
                energy: '21'
            },
            {
                energy: '209'
            }
        ];

        expect(paginationFilteredLoader.sortData(records)).toEqual([
            {
                energy: '21'
            },
            {
                energy: '209'
            },
            {
                energy: '1000'
            }
        ]);

        paginationFilteredLoader.state = {
            currentSort: [['energy', (value) => parseInt(value, 10)]],
            sortAscending: false
        };

        expect(paginationFilteredLoader.sortData(records)).toEqual([
            {
                energy: '1000'
            },
            {
                energy: '209'
            },
            {
                energy: '21'
            }
        ]);
    });
})
