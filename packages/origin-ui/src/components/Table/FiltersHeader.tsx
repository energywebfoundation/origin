import React, { Component } from 'react';
import './FiltersHeader.scss';
import { FilterIcon } from '../icons/FilterIcon';
import { IndividualFilter } from './IndividualFilter';
import clsx from 'clsx';

export enum CustomFilterInputType {
    assetType = 'assetType',
    string = 'string',
    multiselect = 'multiselect',
    dropdown = 'dropdown',
    slider = 'slider',
    yearMonth = 'yearMonth'
}

interface ICustomFilterAvailableOption {
    label: string;
    value: any;
}

interface ICustomFilterInput {
    type: CustomFilterInputType;
    availableOptions?: ICustomFilterAvailableOption[];
    defaultOptions?: any[];
    min?: number;
    max?: number;
}

export interface ICustomFilterDefinition {
    property: string;
    label: string;
    input: ICustomFilterInput;
    search?: boolean;
}

export interface ICustomFilter extends ICustomFilterDefinition {
    selectedValue: any;
}

interface IProps {
    filters: ICustomFilterDefinition[];
    filtersChanged: (filters: ICustomFilter[]) => void;
}

interface IState {
    menuShown: boolean;
    processedFilters: ICustomFilter[];
}

export class FiltersHeader extends Component<IProps, IState> {
    constructor(props, context) {
        super(props, context);

        this.state = {
            menuShown: false,
            processedFilters: []
        };

        this.changeFilterValue = this.changeFilterValue.bind(this);
    }

    changeFilterValue(targetFilter: ICustomFilter, selectedValue: any) {
        const { processedFilters } = this.state;
        const index = processedFilters.indexOf(targetFilter);

        const updatedFilter: ICustomFilter = {
            ...targetFilter,
            selectedValue
        };

        const updatedFilters = [
            ...processedFilters.slice(0, index),
            updatedFilter,
            ...processedFilters.slice(index + 1)
        ];

        this.props.filtersChanged(updatedFilters);

        this.setState({
            processedFilters: updatedFilters
        });
    }

    setupProcessedFilters() {
        if (!this.props.filters) {
            return;
        }

        const processedFilters: ICustomFilter[] = this.props.filters.map(filter => {
            if (filter.input.type === CustomFilterInputType.multiselect) {
                return {
                    ...filter,
                    selectedValue: filter.input.defaultOptions
                };
            }

            return {
                ...filter,
                selectedValue: null
            };
        });

        this.setState({
            processedFilters
        });
    }

    componentDidMount() {
        this.setupProcessedFilters();
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(prevProps) === JSON.stringify(this.props)) {
            return;
        }

        this.setupProcessedFilters();
    }

    render() {
        const { menuShown, processedFilters } = this.state;

        if (processedFilters.length === 0) {
            return null;
        }

        const searchFilter = processedFilters.find(f => f.search);

        const standardFilters = processedFilters.filter(f => !f.search);

        return (
            <>
                {searchFilter && (
                    <div className="pb-4">
                        <IndividualFilter
                            filter={searchFilter}
                            changeFilterValue={this.changeFilterValue}
                        />
                    </div>
                )}

                {standardFilters.length > 0 && (
                    <div className="FiltersHeader">
                        <div
                            className={`Filter ${menuShown ? 'Filter-opened' : ''}`}
                            onClick={() => this.setState({ menuShown: !menuShown })}
                        >
                            <div className="Filter_icon">
                                <FilterIcon />
                            </div>
                            Filter
                        </div>
                        {menuShown && (
                            <div className="Filter_menu">
                                {standardFilters.map((filter, index) => {
                                    return (
                                        <div
                                            className={clsx('Filter_menu_item', {
                                                'Filter_menu_item-fullWidth':
                                                    filter.input &&
                                                    filter.input.type ===
                                                        CustomFilterInputType.assetType
                                            })}
                                            key={index}
                                        >
                                            <IndividualFilter
                                                filter={filter}
                                                changeFilterValue={this.changeFilterValue}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </>
        );
    }
}
