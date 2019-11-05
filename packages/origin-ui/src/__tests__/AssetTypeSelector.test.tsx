import React, { useState } from 'react';
import { mount } from 'enzyme';
import { EncodedAssetType, IRECAssetService } from '@energyweb/utils-general';
import { setupStore, WrapperComponent } from './utils/helpers';
import { dataTestSelector } from '../utils/Helper';
import {
    MultiSelectAutocomplete,
    IAutocompleteMultiSelectOptionType
} from '../components/MultiSelectAutocomplete';
import { act } from '@testing-library/react';
import { HierarchicalMultiSelect } from '../components/HierarchicalMultiSelect';

describe('AssetTypeSelector', () => {
    it('correctly renders', async () => {
        const { store, history, cleanupStore } = setupStore(undefined, {
            mockUserFetcher: true,
            logActions: false
        });

        function TestWrapper() {
            const [selectedAssetType, setSelectedAssetType] = useState<EncodedAssetType>([]);
            const irecAssetService = new IRECAssetService();

            return (
                <HierarchicalMultiSelect
                    selectedValue={selectedAssetType}
                    onChange={setSelectedAssetType}
                    allValues={irecAssetService.AssetTypes}
                    selectOptions={[
                        {
                            label: 'Asset type',
                            placeholder: 'Select asset type'
                        },
                        {
                            label: 'Asset type',
                            placeholder: 'Select asset type'
                        },
                        {
                            label: 'Asset type',
                            placeholder: 'Select asset type'
                        }
                    ]}
                />
            );
        }

        const rendered = mount(
            <WrapperComponent store={store} history={history}>
                <TestWrapper />
            </WrapperComponent>
        );

        function assertTypesLevel(level: number, expectedTypes: string[]) {
            expect(
                rendered
                    .find(
                        `${dataTestSelector(
                            `hierarchical-multi-select-level-${level}`
                        )} .MuiChip-label`
                    )
                    .map(e => e.text())
            ).toStrictEqual(expectedTypes);
        }

        function changeTypesLevel(level: number, types: IAutocompleteMultiSelectOptionType[]) {
            act(() => {
                rendered
                    .find(dataTestSelector(`hierarchical-multi-select-level-${level}`))
                    .find(MultiSelectAutocomplete)
                    .props()
                    .onChange(types);
            });

            rendered.update();
        }

        assertTypesLevel(1, []);
        assertTypesLevel(2, []);
        assertTypesLevel(3, []);

        changeTypesLevel(1, [
            {
                label: 'Solar',
                value: 'Solar'
            }
        ]);

        assertTypesLevel(1, ['Solar']);
        assertTypesLevel(2, ['Solar - Photovoltaic', 'Solar - Concentration']);
        assertTypesLevel(3, [
            'Solar - Photovoltaic - Roof mounted',
            'Solar - Photovoltaic - Ground mounted',
            'Solar - Photovoltaic - Classic silicon'
        ]);

        changeTypesLevel(1, []);

        assertTypesLevel(1, []);
        assertTypesLevel(2, []);
        assertTypesLevel(3, []);

        changeTypesLevel(1, [
            {
                label: 'Wind',
                value: 'Wind'
            }
        ]);

        assertTypesLevel(1, ['Wind']);
        assertTypesLevel(2, ['Wind - Onshore', 'Wind - Offshore']);
        assertTypesLevel(3, []);

        changeTypesLevel(1, [
            {
                label: 'Wind',
                value: 'Wind'
            },
            {
                label: 'Solar',
                value: 'Solar'
            }
        ]);

        assertTypesLevel(1, ['Wind', 'Solar']);
        assertTypesLevel(2, [
            'Wind - Onshore',
            'Wind - Offshore',
            'Solar - Photovoltaic',
            'Solar - Concentration'
        ]);
        assertTypesLevel(3, [
            'Solar - Photovoltaic - Roof mounted',
            'Solar - Photovoltaic - Ground mounted',
            'Solar - Photovoltaic - Classic silicon'
        ]);

        cleanupStore();
    });
});
