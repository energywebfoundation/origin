import React from 'react';
import { ICustomFilter, CustomFilterInputType } from './FiltersHeader';
import { CustomSlider, CustomSliderThumbComponent } from '../CustomSlider';
import { DatePicker } from '@material-ui/pickers';
import { IRECDeviceService } from '@energyweb/utils-general';
import {
    InputLabel,
    FormControl,
    Select,
    MenuItem,
    TextField,
    FilledInput,
    Chip
} from '@material-ui/core';
import { Moment } from 'moment';
import { dataTest } from '../../utils/helper';
import { HierarchicalMultiSelect } from '../HierarchicalMultiSelect';

interface IProps {
    filter: ICustomFilter;
    changeFilterValue: (targetFilter: ICustomFilter, selectedValue: any) => void;
}

export function IndividualFilter(props: IProps) {
    const irecDeviceService = new IRECDeviceService();

    const { filter } = props;

    if (!filter) {
        return null;
    }

    switch (filter.input.type) {
        case CustomFilterInputType.string:
            return (
                <FormControl fullWidth={true} variant="filled">
                    <TextField
                        onChange={e => props.changeFilterValue(filter, e.target.value)}
                        value={filter.selectedValue ? filter.selectedValue : ''}
                        label={filter.label}
                        fullWidth={true}
                        variant="filled"
                        {...dataTest(`${filter.label}-textfield`)}
                    />
                </FormControl>
            );
        case CustomFilterInputType.multiselect:
            return (
                <FormControl fullWidth={true} variant="filled">
                    <InputLabel>{filter.label}</InputLabel>
                    <Select
                        multiple
                        value={filter.selectedValue}
                        onChange={e => props.changeFilterValue(filter, e.target.value)}
                        input={<FilledInput />}
                        renderValue={selected => (
                            <>
                                {(selected as string[]).map(value => (
                                    <Chip
                                        color="primary"
                                        key={value}
                                        label={
                                            filter.input.availableOptions.find(
                                                o => o.value === value
                                            ).label
                                        }
                                    />
                                ))}
                            </>
                        )}
                    >
                        {filter.input.availableOptions.map(option => (
                            <MenuItem
                                key={option.value}
                                value={option.value}
                                style={{
                                    fontWeight:
                                        filter.selectedValue.indexOf(option.value) === -1
                                            ? 300
                                            : 600
                                }}
                            >
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            );
        case CustomFilterInputType.deviceType:
            return (
                <HierarchicalMultiSelect
                    selectedValue={filter.selectedValue ? filter.selectedValue : []}
                    onChange={e => props.changeFilterValue(filter, e)}
                    allValues={irecDeviceService.DeviceTypes}
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
                />
            );
        case CustomFilterInputType.dropdown:
            return (
                <FormControl fullWidth={true} variant="filled">
                    <InputLabel>{filter.label}</InputLabel>
                    <Select
                        value={filter.selectedValue ? filter.selectedValue : ''}
                        onChange={e => props.changeFilterValue(filter, e.target.value)}
                        fullWidth={true}
                        variant="filled"
                        input={<FilledInput />}
                    >
                        <MenuItem value="">Any</MenuItem>
                        {filter.input.availableOptions.map(option => (
                            <MenuItem value={option.value} key={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            );
        case CustomFilterInputType.slider:
            return (
                <div className="Filter_menu_item_sliderWrapper">
                    <InputLabel shrink={true}>{filter.label}</InputLabel>
                    <CustomSlider
                        valueLabelDisplay="on"
                        defaultValue={filter.selectedValue || [filter.input.min, filter.input.max]}
                        min={filter.input.min}
                        max={filter.input.max}
                        ThumbComponent={CustomSliderThumbComponent}
                        onChangeCommitted={(event, value) => props.changeFilterValue(filter, value)}
                    />
                </div>
            );
        case CustomFilterInputType.yearMonth:
            return (
                <DatePicker
                    openTo="year"
                    views={['year', 'month']}
                    label={filter.label}
                    value={filter.selectedValue}
                    onChange={(date: Moment) => props.changeFilterValue(filter, date)}
                    variant="inline"
                    inputVariant="filled"
                    fullWidth={true}
                />
            );
    }
}
