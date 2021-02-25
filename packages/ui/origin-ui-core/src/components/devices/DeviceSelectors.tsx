import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Grid, GridSize, Theme, useTheme } from '@material-ui/core';
import { getRegions, getOffchainConfiguration, getEnvironment } from '../../features/general';
import { isDeviceLocationEnabled, isDeviceGridOperatorEnabled } from '../../utils/device';
import { ANY_VALUE, ANY_OPERATOR } from '../../utils/exchange';
import { HierarchicalMultiSelect } from '../Form';

interface IProps {
    location: string[];
    gridOperator: string[];
    disabled: boolean;
    onLocationChange: (value: string[]) => void;
    onGridOperatorChange: (value: string[]) => void;
    singleChoice?: boolean;
    gridItemSize?: GridSize;
    required?: boolean;
    inlinePadding?: boolean;
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
        required,
        inlinePadding
    } = { gridItemSize: 6 as GridSize, ...props };

    const regions = useSelector(getRegions);
    regions[ANY_VALUE] = [];
    const configuration = useSelector(getOffchainConfiguration);
    const environment = useSelector(getEnvironment);
    const { t } = useTranslation();
    const { spacing }: Theme = useTheme();

    if (!configuration) {
        return null;
    }

    return (
        <>
            {isDeviceLocationEnabled(environment) && (
                <Grid
                    item
                    xs={gridItemSize}
                    style={{ paddingRight: inlinePadding ? spacing(1) : 0 }}
                >
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
                <Grid
                    item
                    xs={gridItemSize}
                    style={{ paddingLeft: inlinePadding ? spacing(1) : 0 }}
                >
                    <HierarchicalMultiSelect
                        selectedValue={gridOperator}
                        onChange={onGridOperatorChange}
                        options={Object.assign(
                            configuration.gridOperators?.reduce((a, b) => ({ ...a, [b]: [] }), {}),
                            { [ANY_OPERATOR]: [] }
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
