import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Button, makeStyles } from '@material-ui/core';
import { BigNumber } from 'ethers';
import {
    CertificateSource,
    LightenColor,
    EnergyFormatter,
    formatDate,
    moment,
    DeviceIcon
} from '@energyweb/origin-ui-core';
import { useOriginConfiguration } from '../../../utils/configuration';

export interface IInboxItemData {
    id: string;
    name: string;
    country: string;
    type: string;
    capacity: number;
    certificates: IInboxCertificateData[];
}

export interface IInboxCertificateData {
    id: number;
    dateStart: number;
    dateEnd: number;
    energy: BigNumber;
    maxEnergy: BigNumber;
    source: CertificateSource;
    assetId: string;
}

export function InboxItem(props: {
    device: IInboxItemData;
    selected: number[];
    selectedDevices: string[];
    onDeviceSelect: (id: string) => void;
    onCertificateSelect: (id: number, deviceId: string) => void;
    onViewClick: (id: number) => void;
}): JSX.Element {
    const {
        device,
        selected,
        onDeviceSelect,
        onCertificateSelect,
        selectedDevices,
        onViewClick
    } = props;
    const configuration = useOriginConfiguration();

    const mainBgColor = configuration?.styleConfig?.MAIN_BACKGROUND_COLOR;
    const simpleTextColor = configuration?.styleConfig?.SIMPLE_TEXT_COLOR;
    const defaultTextColor = configuration?.styleConfig?.TEXT_COLOR_DEFAULT;
    const primaryDimColor = configuration?.styleConfig?.PRIMARY_COLOR_DIM;
    const primaryColor = configuration?.styleConfig?.PRIMARY_COLOR;

    const unselectedIconColor = LightenColor(defaultTextColor, -7);

    const useStyles = makeStyles({
        device: {
            padding: '18px 20px',
            background: LightenColor(mainBgColor, 4),
            boxShadow: '0 2px 4px rgba(0,0,0,.2)',
            display: 'flex',
            flexDirection: 'row'
        },

        verticalCenter: {
            display: 'flex',
            alignItems: 'center'
        },

        entry: {
            marginBottom: '10px'
        },

        certificate: {
            padding: '18px 20px',
            background: LightenColor(mainBgColor, 6),
            boxShadow: '0 2px 4px rgba(0,0,0,.2)',
            display: 'flex',
            flexDirection: 'row',
            borderBottom: '1px solid #464646'
        },

        selected: {
            background: primaryDimColor
        },

        text_1: {
            fontSize: '16px',
            color: simpleTextColor
        },

        text_2: {
            fontSize: '14px',
            color: simpleTextColor,
            opacity: '.5'
        },

        text_3: {
            fontSize: '12px',
            color: simpleTextColor,
            opacity: '.5'
        },

        checkbox: {
            marginRight: '20px'
        },

        iconContainer: {
            display: 'flex',
            alignItems: 'center'
        },

        icon: {
            width: 55,
            height: 55,
            marginRight: '25px'
        }
    });

    const classes = useStyles();

    const { t } = useTranslation();

    return (
        <div className={classes.entry}>
            <div className={classes.device}>
                <div className={classes.checkbox}>
                    <Checkbox
                        color={'primary'}
                        checked={selectedDevices.includes(device.id)}
                        onChange={() => onDeviceSelect(device.id)}
                    />
                </div>
                <div
                    style={{ flex: '1' }}
                    className={[classes.text_1, classes.verticalCenter].join(' ')}
                >
                    {device.name}
                </div>
                <div className={[classes.text_2, classes.verticalCenter].join(' ')}>
                    {device.country}
                </div>
            </div>
            <div>
                {device.certificates.map((cert) => {
                    const isSelected = selected.includes(cert.id);

                    return (
                        <div
                            key={cert.id}
                            className={[
                                classes.certificate,
                                isSelected ? classes.selected : ''
                            ].join(' ')}
                        >
                            <div className={classes.checkbox}>
                                <Checkbox
                                    color={'primary'}
                                    checked={selected.includes(cert.id)}
                                    onChange={() => onCertificateSelect(cert.id, device.id)}
                                />
                            </div>
                            <div
                                className={classes.iconContainer}
                                style={{
                                    fill: isSelected ? primaryColor : unselectedIconColor
                                }}
                            >
                                <DeviceIcon type={device.type} className={classes.icon} />
                            </div>
                            <div style={{ flex: '1' }}>
                                <div className={classes.text_2}>{device.type}</div>
                                <div
                                    style={{ marginBottom: '12px', opacity: '.5' }}
                                    className={classes.text_1}
                                >
                                    {EnergyFormatter.format(cert.maxEnergy, true)}
                                </div>

                                <div>
                                    <div className={classes.text_2}>Generation Time Frame</div>
                                    <div className={classes.text_3}>
                                        {formatDate(moment.unix(cert.dateStart))}
                                        {' - '}
                                        {formatDate(moment.unix(cert.dateEnd))}
                                    </div>
                                </div>
                            </div>

                            <div className={classes.verticalCenter}>
                                <Button
                                    variant="outlined"
                                    onClick={() => onViewClick(cert.id)}
                                    size="small"
                                    color="primary"
                                >
                                    {t('certificate.actions.view')}
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
