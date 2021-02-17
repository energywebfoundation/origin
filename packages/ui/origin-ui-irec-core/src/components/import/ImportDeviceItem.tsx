import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { LightenColor } from '@energyweb/origin-ui-core';
import { useOriginConfiguration } from '../../utils/configuration';

export interface IDevice {
    id: number;
    name: string;
    country: string;
    capacity: number;
    imported?: boolean;
}

export function ImportDeviceItem(props: { device: IDevice; onImport: () => void }): JSX.Element {
    const {
        MAIN_BACKGROUND_COLOR,
        PRIMARY_COLOR,
        SIMPLE_TEXT_COLOR,
        TEXT_COLOR_DEFAULT
    } = useOriginConfiguration()?.styleConfig;

    const useStyles = makeStyles({
        device: {
            background: LightenColor(MAIN_BACKGROUND_COLOR, 4),
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
            background: LightenColor(MAIN_BACKGROUND_COLOR, 6),
            display: 'flex',
            justifyContent: 'space-evenly'
        },

        icon: {
            width: 55,
            height: 55,
            color: TEXT_COLOR_DEFAULT,
            background: TEXT_COLOR_DEFAULT,
            marginRight: '22px'
        },

        label: {
            fontSize: 12,
            color: SIMPLE_TEXT_COLOR,
            opacity: 0.75
        },

        value: {
            fontSize: 14,
            color: SIMPLE_TEXT_COLOR
        },

        name: {
            fontSize: 16,
            color: SIMPLE_TEXT_COLOR
        },

        grow: {
            flex: 1
        },

        button: {
            borderColor: PRIMARY_COLOR
        },

        buttonLabel: {
            color: PRIMARY_COLOR,
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
                {!device.imported && (
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
                    <div className={classes.value}>{device.country}</div>
                </div>
            </div>
        </div>
    );
}
