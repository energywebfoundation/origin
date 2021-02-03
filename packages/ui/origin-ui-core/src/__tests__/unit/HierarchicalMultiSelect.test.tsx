import { DeviceTypeService, EncodedDeviceType } from '@energyweb/utils-general';
import { act } from '@testing-library/react';
import { mount, ReactWrapper } from 'enzyme';
import React, { useState } from 'react';

import { HierarchicalMultiSelect } from '../../components/HierarchicalMultiSelect';
import { MultiSelectAutocomplete } from '../../components/MultiSelectAutocomplete';
import { dataTestSelector } from '../../utils';
import { setupStore, WrapperComponent } from '../utils/helpers';

let cleanupStore: () => void;

function renderComponent(singleChoice = false) {
    function TestWrapper() {
        const [selectedDeviceType, setSelectedDeviceType] = useState<EncodedDeviceType>([]);
        const deviceTypeService = new DeviceTypeService([
            ['Solar'],
            ['Solar', 'Photovoltaic'],
            ['Solar', 'Photovoltaic', 'Roof mounted'],
            ['Solar', 'Photovoltaic', 'Ground mounted'],
            ['Solar', 'Photovoltaic', 'Classic silicon'],
            ['Solar', 'Concentration'],
            ['Wind'],
            ['Wind', 'Onshore'],
            ['Wind', 'Offshore'],
            ['Solid'],
            ['Solid', 'Muncipal waste'],
            ['Solid', 'Muncipal waste', 'Biogenic'],
            ['Solid', 'Industrial and commercial waste'],
            ['Solid', 'Industrial and commercial waste', 'Biogenic'],
            ['Solid', 'Wood'],
            ['Solid', 'Wood', 'Forestry products'],
            ['Solid', 'Wood', 'Forestry by-products & waste'],
            ['Solid', 'Animal fats'],
            ['Solid', 'Biomass from agriculture'],
            ['Solid', 'Biomass from agriculture', 'Agricultural products'],
            ['Solid', 'Biomass from agriculture', 'Agricultural by-products & waste']
        ]);

        return (
            <HierarchicalMultiSelect
                selectedValue={selectedDeviceType}
                onChange={setSelectedDeviceType}
                allValues={deviceTypeService.deviceTypes}
                selectOptions={[
                    {
                        label: 'Device type',
                        placeholder: 'Select device type'
                    },
                    {
                        label: 'Device type',
                        placeholder: 'Select device type'
                    },
                    {
                        label: 'Device type',
                        placeholder: 'Select device type'
                    }
                ]}
                singleChoice={singleChoice}
            />
        );
    }

    const setupStoreResult = setupStore(undefined, {
        mockUserFetcher: true,
        logActions: false
    });

    cleanupStore = setupStoreResult.cleanupStore;

    return mount(
        <WrapperComponent store={setupStoreResult.store} history={setupStoreResult.history}>
            <TestWrapper />
        </WrapperComponent>
    );
}

function option(text: string) {
    return {
        label: text,
        value: text.split(' - ').join(';')
    };
}

function createHelperFunctions(rendered: ReactWrapper) {
    return {
        assertTypesLevel: (level: number, expectedTypes: string[]) => {
            expect(
                rendered
                    .find(
                        `${dataTestSelector(
                            `hierarchical-multi-select-level-${level}`
                        )} .MuiChip-label`
                    )
                    .map((e) => e.text())
            ).toStrictEqual(expectedTypes);
        },

        changeTypesLevel: (level: number, types: string[]) => {
            act(() => {
                rendered
                    .find(dataTestSelector(`hierarchical-multi-select-level-${level}`))
                    .find(MultiSelectAutocomplete)
                    .props()
                    .onChange(types.map(option));
            });

            rendered.update();
        }
    };
}

describe('HierarchicalMultiSelect', () => {
    afterEach(() => {
        if (cleanupStore) {
            cleanupStore();
        }
    });

    it('multi choice variant works', async () => {
        const rendered = renderComponent();

        const { assertTypesLevel, changeTypesLevel } = createHelperFunctions(rendered);

        assertTypesLevel(1, []);
        assertTypesLevel(2, []);
        assertTypesLevel(3, []);

        changeTypesLevel(1, ['Solar']);
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

        changeTypesLevel(1, ['Wind']);
        assertTypesLevel(1, ['Wind']);
        assertTypesLevel(2, ['Wind - Onshore', 'Wind - Offshore']);
        assertTypesLevel(3, []);

        changeTypesLevel(1, ['Wind', 'Solar']);
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

        // check if correctly removes types from child types, when parent type is removed

        changeTypesLevel(1, []);
        assertTypesLevel(1, []);
        assertTypesLevel(2, []);
        assertTypesLevel(3, []);

        changeTypesLevel(1, ['Solid']);
        assertTypesLevel(1, ['Solid']);
        assertTypesLevel(2, [
            'Solid - Muncipal waste',
            'Solid - Industrial and commercial waste',
            'Solid - Wood',
            'Solid - Animal fats',
            'Solid - Biomass from agriculture'
        ]);
        assertTypesLevel(3, [
            'Solid - Muncipal waste - Biogenic',
            'Solid - Industrial and commercial waste - Biogenic',
            'Solid - Wood - Forestry products',
            'Solid - Wood - Forestry by-products & waste',
            'Solid - Biomass from agriculture - Agricultural products',
            'Solid - Biomass from agriculture - Agricultural by-products & waste'
        ]);

        changeTypesLevel(2, ['Solid - Muncipal waste']);
        assertTypesLevel(1, ['Solid']);
        assertTypesLevel(2, ['Solid - Muncipal waste']);
        assertTypesLevel(3, ['Solid - Muncipal waste - Biogenic']);
    });

    it('single choice variant works', async () => {
        const rendered = renderComponent(true);

        const { assertTypesLevel, changeTypesLevel } = createHelperFunctions(rendered);

        assertTypesLevel(1, []);
        assertTypesLevel(2, []);
        assertTypesLevel(3, []);

        changeTypesLevel(1, ['Solar']);
        assertTypesLevel(1, ['Solar']);
        assertTypesLevel(2, []);
        assertTypesLevel(3, []);

        changeTypesLevel(1, ['Solar', 'Wind']);
        assertTypesLevel(1, ['Solar']);

        changeTypesLevel(1, []);
        assertTypesLevel(1, []);

        changeTypesLevel(1, ['Wind']);
        assertTypesLevel(1, ['Wind']);

        changeTypesLevel(1, ['Solar']);
        assertTypesLevel(1, ['Solar']);

        changeTypesLevel(2, ['Solar - Photovoltaic']);
        assertTypesLevel(2, ['Solar - Photovoltaic']);
        assertTypesLevel(3, []);

        changeTypesLevel(2, ['Solar - Photovoltaic', 'Solar - Concentration']);
        assertTypesLevel(2, ['Solar - Photovoltaic']);

        changeTypesLevel(2, []);
        assertTypesLevel(2, []);

        changeTypesLevel(2, ['Solar - Photovoltaic']);
        assertTypesLevel(2, ['Solar - Photovoltaic']);
        assertTypesLevel(3, []);

        changeTypesLevel(3, ['Solar - Photovoltaic - Classic silicon']);
        assertTypesLevel(3, ['Solar - Photovoltaic - Classic silicon']);

        changeTypesLevel(3, [
            'Solar - Photovoltaic - Classic silicon',
            'Solar - Photovoltaic - Roof mounted'
        ]);
        assertTypesLevel(3, ['Solar - Photovoltaic - Classic silicon']);

        changeTypesLevel(3, []);
        assertTypesLevel(3, []);

        changeTypesLevel(3, ['Solar - Photovoltaic - Classic silicon']);
        assertTypesLevel(3, ['Solar - Photovoltaic - Classic silicon']);

        changeTypesLevel(1, []);
        assertTypesLevel(1, []);
        assertTypesLevel(2, []);
        assertTypesLevel(3, []);
    });
});
