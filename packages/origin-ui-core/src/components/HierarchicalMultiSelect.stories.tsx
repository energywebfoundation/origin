/* eslint-disable import/no-extraneous-dependencies */
import React, { useState } from 'react';
import { withKnobs, boolean, object } from '@storybook/addon-knobs';
import { HierarchicalMultiSelect } from './HierarchicalMultiSelect';
import { DeviceTypeService, EncodedDeviceType } from '@energyweb/utils-general';
import { TEST_DEVICE_TYPES } from '../__tests__/utils/helpers';

export default {
    title: 'HierarchicalMultiSelect',
    component: HierarchicalMultiSelect,
    decorators: [withKnobs]
};

function TestWrapper() {
    const singleChoice = boolean('singleChoice', false);
    const [selectedDeviceType, setSelectedDeviceType] = useState<EncodedDeviceType>([]);
    const deviceTypeService = new DeviceTypeService(object('allValues', TEST_DEVICE_TYPES));

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

export const defaultView = () => <TestWrapper />;

export const withoutTheme = () => <TestWrapper />;
