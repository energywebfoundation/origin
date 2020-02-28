/* eslint-disable import/no-extraneous-dependencies */
import React, { useState } from 'react';
import { withKnobs, boolean, object } from '@storybook/addon-knobs';
import { MuiThemeProvider } from '@material-ui/core';
import { HierarchicalMultiSelect } from './HierarchicalMultiSelect';
import {
    createOriginConfiguration,
    OriginConfigurationProvider
} from './OriginConfigurationContext';
import { DeviceTypeService, EncodedDeviceType } from '@energyweb/utils-general';

export default {
    title: 'HierarchicalMultiSelect',
    component: HierarchicalMultiSelect,
    decorators: [withKnobs]
};

function TestWrapper() {
    const singleChoice = boolean('singleChoice', false);
    const [selectedDeviceType, setSelectedDeviceType] = useState<EncodedDeviceType>([]);
    const deviceTypeService = new DeviceTypeService(
        object('allValues', [
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
        ])
    );

    return (
        <HierarchicalMultiSelect
            selectedValue={selectedDeviceType}
            onChange={setSelectedDeviceType}
            allValues={deviceTypeService.deviceTypes}
            selectOptions={object('selectOptions', [
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
            ])}
            singleChoice={singleChoice}
        />
    );
}

const originConfiguration = createOriginConfiguration();

export const defaultView = () => (
    <OriginConfigurationProvider value={originConfiguration}>
        <MuiThemeProvider theme={originConfiguration.materialTheme}>
            <TestWrapper />
        </MuiThemeProvider>
    </OriginConfigurationProvider>
);

export const withoutTheme = () => (
    <OriginConfigurationProvider value={originConfiguration}>
        <TestWrapper />
    </OriginConfigurationProvider>
);
