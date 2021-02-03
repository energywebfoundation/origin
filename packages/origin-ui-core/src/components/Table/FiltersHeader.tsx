import React, { useState, useEffect } from 'react';
import { IndividualFilter } from './IndividualFilter';
import clsx from 'clsx';
import { deepEqual } from '../../utils/helper';
import { FilterList } from '@material-ui/icons';
import { useTheme, makeStyles, createStyles } from '@material-ui/core';
import { useOriginConfiguration } from '../../utils/configuration';
import { LightenColor } from '../../utils';

export enum CustomFilterInputType {
    deviceType = 'deviceType',
    string = 'string',
    multiselect = 'multiselect',
    dropdown = 'dropdown',
    slider = 'slider',
    yearMonth = 'yearMonth',
    day = 'day'
}

export enum FilterRules {
    EQUAL = 'FILTER_RULES::EQUAL',
    FROM = 'FILTER_RULES::FROM',
    TO = 'FILTER_RULES::TO'
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
    filterRule?: FilterRules;
}

export type RecordPropertyGetterFunction = (record: any) => string | number;

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
    dependantFilters?: (filters: ICustomFilter[]) => ICustomFilter[];
}

export function FiltersHeader(props: IProps) {
    const [menuShown, setMenuShown] = useState(false);
    const [processedFilters, setProcessedFilters] = useState<ICustomFilter[]>([]);
    const { spacing } = useTheme();
    const originConfiguration = useOriginConfiguration();
    const originSimpleTextColor = originConfiguration?.styleConfig?.SIMPLE_TEXT_COLOR;
    const originBgColor = originConfiguration?.styleConfig?.MAIN_BACKGROUND_COLOR;
    const { dependantFilters } = props;

    const filterBg = LightenColor(originBgColor, 5);

    const useStyles = makeStyles(() =>
        createStyles({
            filterOpened: {
                display: 'block',
                backgroundColor: filterBg,
                width: '100%'
            }
        })
    );

    const classes = useStyles(useTheme());

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

        const newProcessedFilters: ICustomFilter[] = props.filters.map((filter) => {
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
    }, []);

    if (processedFilters.length === 0) {
        return null;
    }

    const searchFilter = processedFilters.find((f) => f.search);
    const nonSearchFilters = processedFilters.filter((f) => !f.search);
    const filtersWithDependency = dependantFilters ? dependantFilters(nonSearchFilters) : null;

    const standardFilters = filtersWithDependency ?? nonSearchFilters;

    return (
        <>
            {searchFilter && (
                <div className="pb-4">
                    <IndividualFilter filter={searchFilter} changeFilterValue={changeFilterValue} />
                </div>
            )}

            {standardFilters.length > 0 && (
                <div>
                    <div
                        className={`Filter ${menuShown ? classes.filterOpened : ''}`}
                        onClick={() => setMenuShown(!menuShown)}
                        style={{ color: originSimpleTextColor }}
                    >
                        <div className="Filter_icon">
                            <FilterList />
                        </div>
                        Filter
                    </div>
                    {menuShown && (
                        <div
                            className="Filter_menu"
                            style={{
                                marginBottom: spacing(2),
                                paddingBottom: spacing(1),
                                backgroundColor: filterBg
                            }}
                        >
                            {standardFilters.map((filter, index) => {
                                return (
                                    <div className={clsx('Filter_menu_item')} key={index}>
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
