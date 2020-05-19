import React from 'react';
import { useTranslation, isDeviceLocationEnabled, isDeviceGridOperatorEnabled } from '../utils';
import { HierarchicalMultiSelect } from './HierarchicalMultiSelect';
import { Grid, GridSize } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { getRegions, getOffchainConfiguration, getEnvironment } from '../features';

interface IProps {
    location: string[];
    gridOperator: string[];
    disabled: boolean;
    onLocationChange: (value: string[]) => void;
    onGridOperatorChange: (value: string[]) => void;
    singleChoice?: boolean;
    gridItemSize?: GridSize;
    required?: boolean;
}

export function DeviceSelectors(props: IProps) {
    const {
        location,
        gridOperator,
        onGridOperatorChange,
        onLocationChange,
        disabled,
        singleChoice,
        gridItemSize,
        required
    } = { gridItemSize: 6 as GridSize, ...props };

    const regions = useSelector(getRegions);
    const configuration = useSelector(getOffchainConfiguration);
    const environment = useSelector(getEnvironment);
    const { t } = useTranslation();

    if (!configuration) {
        return null;
    }

    return (
        <>
            {isDeviceLocationEnabled(environment) && (
                <Grid item xs={gridItemSize}>
                    <HierarchicalMultiSelect
                        selectedValue={location}
                        onChange={onLocationChange}
                        options={regions}
                        selectOptions={[
                            {
                                label: t('device.properties.regions'),
                                placeholder: t('device.info.selectRegion')
                            },
                            {
                                label: t('device.properties.provinces'),
                                placeholder: t('device.info.selectProvince')
                            }
                        ]}
                        singleChoice={singleChoice}
                        disabled={disabled}
                        required={required}
                    />
                </Grid>
            )}

            {isDeviceGridOperatorEnabled(environment) && (
                <Grid item xs={gridItemSize}>
                    <HierarchicalMultiSelect
                        selectedValue={gridOperator}
                        onChange={onGridOperatorChange}
                        options={configuration.gridOperators?.reduce(
                            (a, b) => ({ ...a, [b]: [] }),
                            {}
                        )}
                        selectOptions={[
                            {
                                label: t('device.properties.gridOperator'),
                                placeholder: t('device.info.selectGridOperator')
                            }
                        ]}
                        singleChoice={singleChoice}
                        disabled={disabled}
                        required={required}
                    />
                </Grid>
            )}
        </>
    );
}
