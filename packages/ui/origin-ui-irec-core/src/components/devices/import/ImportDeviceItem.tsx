import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { LightenColor } from '@energyweb/origin-ui-core';
import { useOriginConfiguration } from '../../../utils';
import { ComposedDevice } from '../../../types';

export function ImportDeviceItem(props: {
    device: ComposedDevice;
    onImport: () => void;
}): JSX.Element {
    const configuration = useOriginConfiguration();

    const mainBgColor = configuration?.styleConfig?.MAIN_BACKGROUND_COLOR;
    const simpleTextColor = configuration?.styleConfig?.SIMPLE_TEXT_COLOR;
    const defaultTextColor = configuration?.styleConfig?.TEXT_COLOR_DEFAULT;
    const primaryColor = configuration?.styleConfig?.PRIMARY_COLOR;

    const useStyles = makeStyles({
        device: {
            background: LightenColor(mainBgColor, 4),
            marginBottom: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,.2)'
        },

        header: {
            padding: '12px 18px',
            display: 'flex'
        },

        footer: {
            padding: '12px 0 16px 0',
            boxSizing: 'border-box',
            background: LightenColor(mainBgColor, 6),
            display: 'flex',
            justifyContent: 'space-evenly'
        },

        icon: {
            width: 55,
            height: 55,
            color: defaultTextColor,
            background: defaultTextColor,
            marginRight: '22px'
        },

        label: {
            fontSize: 12,
            color: simpleTextColor,
            opacity: 0.75
        },

        value: {
            fontSize: 14,
            color: simpleTextColor
        },

        name: {
            fontSize: 16,
            color: simpleTextColor
        },

        grow: {
            flex: 1
        },

        button: {
            borderColor: primaryColor
        },

        buttonLabel: {
            color: primaryColor,
            textTransform: 'uppercase'
        }
    });

    const { device, onImport } = props;
    const { t } = useTranslation();

    const classes = useStyles();

    return (
        <div className={classes.device}>
            <div className={classes.header}>
                <div className={classes.icon}>O</div>
                <div className={classes.grow}>
                    <div className={classes.label}>Device:</div>
                    <div className={classes.name}>{device.name}</div>
                </div>
                {!device.externalRegistryId && (
                    <div>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={onImport}
                            classes={{
                                label: classes.buttonLabel,
                                root: classes.button
                            }}
                        >
                            {t('device.actions.import')}
                        </Button>
                    </div>
                )}
            </div>
            <div className={classes.footer}>
                <div>
                    <div className={classes.label}>{t('device.properties.capacity')} (MW)</div>
                    <div className={classes.value}>{device.capacity}</div>
                </div>
                <div>
                    <div className={classes.label}>{t('device.properties.country')}</div>
                    <div className={classes.value}>{device.countryCode}</div>
                </div>
            </div>
        </div>
    );
}
