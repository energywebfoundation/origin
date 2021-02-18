import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Button, makeStyles } from '@material-ui/core';
import { BigNumber } from 'ethers';
import { CertificateSource } from '../../../features/certificates';
import { useOriginConfiguration } from '../../../utils/configuration';
import { LightenColor } from '../../../utils/colors';
import { EnergyFormatter } from '../../../utils/EnergyFormatter';
import { formatDate, moment } from '../../../utils/time';
import { DeviceIcon } from '../../Icons';

export interface IInboxItemData {
    id: string;
    name: string;
    country: string;
    type: string;
    capacity: number;
    certificates: IInboxCertificateData[];
}

export interface IInboxCertificateData {
    id: string;
    dateStart: number;
    dateEnd: number;
    energy: BigNumber;
    maxEnergy: BigNumber;
    source: CertificateSource;
    assetId: string;
}

export function InboxItem(props: {
    device: IInboxItemData;
    selected: string[];
    selectedDevices: string[];
    onDeviceSelect: (id: string) => void;
    onCertificateSelect: (id: string, deviceId: string) => void;
    onViewClick: (id: string) => void;
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

    const {
        MAIN_BACKGROUND_COLOR,
        SIMPLE_TEXT_COLOR,
        PRIMARY_COLOR_DIM
    } = configuration?.styleConfig;

    const useStyles = makeStyles({
        device: {
            padding: '18px 20px',
            background: LightenColor(MAIN_BACKGROUND_COLOR, 4),
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
            background: LightenColor(MAIN_BACKGROUND_COLOR, 6),
            boxShadow: '0 2px 4px rgba(0,0,0,.2)',
            display: 'flex',
            flexDirection: 'row',
            borderBottom: '1px solid #464646'
        },

        selected: {
            background: PRIMARY_COLOR_DIM
        },

        text_1: {
            fontSize: '16px',
            color: SIMPLE_TEXT_COLOR
        },

        text_2: {
            fontSize: '14px',
            color: SIMPLE_TEXT_COLOR,
            opacity: '.5'
        },

        text_3: {
            fontSize: '12px',
            color: SIMPLE_TEXT_COLOR,
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
                    return (
                        <div
                            key={cert.id}
                            className={[
                                classes.certificate,
                                selected.includes(cert.id) ? classes.selected : ''
                            ].join(' ')}
                        >
                            <div className={classes.checkbox}>
                                <Checkbox
                                    color={'primary'}
                                    checked={selected.includes(cert.id)}
                                    onChange={() => onCertificateSelect(cert.id, device.id)}
                                />
                            </div>
                            <div className={classes.iconContainer}>
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
