import React, { useState, useEffect } from 'react';
import './FiltersHeader.scss';
import { FilterIcon } from '../icons/FilterIcon';
import { IndividualFilter } from './IndividualFilter';
import clsx from 'clsx';
import { deepEqual } from '../../utils/helper';

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
    defaultOptions?: string[];
    min?: number;
    max?: number;
}

export type RecordPropertyGetterFunction = (record: any) => string;

export interface ICustomFilterDefinition {
    property: RecordPropertyGetterFunction;
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

export function FiltersHeader(props: IProps) {
    const [menuShown, setMenuShown] = useState(false);
    const [processedFilters, setProcessedFilters] = useState<ICustomFilter[]>([]);

    function changeFilterValue(targetFilter: ICustomFilter, selectedValue: any) {
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

        props.filtersChanged(updatedFilters);

        setProcessedFilters(updatedFilters);
    }

    function setupProcessedFilters() {
        if (
            !props.filters ||
            deepEqual(
                props.filters,
                processedFilters.map(({ label, input, search, property: propertyNew }) => ({
                    label,
                    input,
                    search,
                    propertyNew
                }))
            )
        ) {
            return;
        }

        const newProcessedFilters: ICustomFilter[] = props.filters.map(filter => {
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

        setProcessedFilters(newProcessedFilters);
    }

    useEffect(() => {
        setupProcessedFilters();
    }, [props.filters]);

    if (processedFilters.length === 0) {
        return null;
    }

    const searchFilter = processedFilters.find(f => f.search);
    const standardFilters = processedFilters.filter(f => !f.search);

    return (
        <>
            {searchFilter && (
                <div className="pb-4">
                    <IndividualFilter filter={searchFilter} changeFilterValue={changeFilterValue} />
                </div>
            )}

            {standardFilters.length > 0 && (
                <div className="FiltersHeader">
                    <div
                        className={`Filter ${menuShown ? 'Filter-opened' : ''}`}
                        onClick={() => setMenuShown(!menuShown)}
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
                                            changeFilterValue={changeFilterValue}
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
