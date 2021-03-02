import React from 'react';
import { Checkbox, FormControl, makeStyles } from '@material-ui/core';
import { LightenColor } from '@energyweb/origin-ui-core';
import { useOriginConfiguration } from '../../../utils/configuration';
import { IDevice } from '../../../containers/Certificate/CertificateImport';

export function CertificateImportItem(props: { device: IDevice; selected: number[] }): JSX.Element {
    const { device, selected = [] } = props;
    const configuration = useOriginConfiguration();

    const mainBgColor = configuration?.styleConfig?.MAIN_BACKGROUND_COLOR;
    const simpleTextColor = configuration?.styleConfig?.SIMPLE_TEXT_COLOR;
    const defaultTextColor = configuration?.styleConfig?.TEXT_COLOR_DEFAULT;
    const primaryDimColor = configuration?.styleConfig?.PRIMARY_COLOR_DIM;

    const useStyles = makeStyles({
        device: {
            padding: '18px 20px',
            background: LightenColor(mainBgColor, 4),
            boxShadow: '0 2px 4px rgba(0,0,0,.2)',
            display: 'flex',
            flexDirection: 'row'
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
            marginRight: '20px',
            display: 'flex',
            justifyContent: 'center'
        },

        iconContainer: {
            display: 'flex',
            alignItems: 'center'
        },

        icon: {
            width: 55,
            height: 55,
            color: defaultTextColor,
            background: defaultTextColor,
            marginRight: '25px'
        }
    });

    const classes = useStyles();

    return (
        <div key={device.id} className={classes.entry}>
            <div className={classes.device}>
                <FormControl className={classes.checkbox}>
                    <Checkbox color={'primary'} checked={selected?.length > 0} />
                </FormControl>
                <div style={{ flex: '1' }}>
                    <div className={classes.text_1}>{device.name}</div>
                    <div className={classes.text_2}>device type</div>
                </div>
                <div className={classes.text_2}>Country</div>
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
                            <FormControl className={classes.checkbox}>
                                <Checkbox color={'primary'} checked={selected.includes(cert.id)} />
                            </FormControl>
                            <div className={classes.iconContainer}>
                                <div className={classes.icon} />
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flex: '1',
                                    flexWrap: 'wrap'
                                }}
                            >
                                <div
                                    style={{ width: '100%', marginBottom: '12px' }}
                                    className={classes.text_1}
                                >
                                    {cert.name}
                                </div>
                                <div style={{ width: '50%' }}>
                                    <div className={classes.text_2}>AAA</div>
                                    <div className={classes.text_3}>BBB</div>
                                </div>
                                <div style={{ width: '50%' }}>
                                    <div className={classes.text_2}>AAA</div>
                                    <div className={classes.text_3}>BBB</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
