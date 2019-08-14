import { PaginatedLoaderFilteredSorted } from '../components/Table/PaginatedLoaderFilteredSorted';

describe('PaginatedLoaderFilteredSorted', () => {
    it('sortData correctly sorts records by multiple properties', async () => {
        class TestClass extends PaginatedLoaderFilteredSorted<any, any> {
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
})
