import React, { Component } from 'react';
import { ICustomFilter, CustomFilterInputType } from './FiltersHeader';
import { CustomSlider, CustomSliderThumbComponent } from '../CustomSlider';
import { DatePicker } from '@material-ui/pickers';
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

interface IProps {
    filter: ICustomFilter;
    changeFilterValue: (targetFilter: ICustomFilter, selectedValue: any) => void;
}

export class IndividualFilter extends Component<IProps> {
    render() {
        const { filter } = this.props;

        if (!filter) {
            return null;
        }

        switch (filter.input.type) {
            case CustomFilterInputType.string:
                return (
                    <FormControl fullWidth={true} variant="filled">
                        <TextField
                            onChange={e => this.props.changeFilterValue(filter, e.target.value)}
                            value={filter.selectedValue ? filter.selectedValue : ''}
                            label={filter.label}
                            fullWidth={true}
                            variant="filled"
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
                            onChange={e => this.props.changeFilterValue(filter, e.target.value)}
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
                            {filter.input.availableOptions.map((option, index) => (
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
            case CustomFilterInputType.dropdown:
                return (
                    <FormControl fullWidth={true} variant="filled">
                        <InputLabel>{filter.label}</InputLabel>
                        <Select
                            value={filter.selectedValue ? filter.selectedValue : ''}
                            onChange={e => this.props.changeFilterValue(filter, e.target.value)}
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
                            defaultValue={
                                filter.selectedValue || [filter.input.min, filter.input.max]
                            }
                            min={filter.input.min}
                            max={filter.input.max}
                            ThumbComponent={CustomSliderThumbComponent}
                            onChangeCommitted={(event, value) =>
                                this.props.changeFilterValue(filter, value)
                            }
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
                        onChange={(date: Moment) => this.props.changeFilterValue(filter, date)}
                        variant="inline"
                        inputVariant="filled"
                        fullWidth={true}
                    />
                );
        }
    }
}
