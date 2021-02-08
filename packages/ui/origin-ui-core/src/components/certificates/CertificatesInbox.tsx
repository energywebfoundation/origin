import React, { useEffect, useState } from 'react';
import { useOriginConfiguration } from '../../utils/configuration';
import { Button, Checkbox, Grid, Tab, Tabs, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
    getCertificates,
    ICertificateViewItem,
    requestPublishForSale,
    requestWithdrawCertificate
} from '../../features/certificates';
import { getEnvironment, getProducingDevices, getUserOffchain } from '../../features';
import { getDeviceId } from '../../utils';
import { IInboxCertificateData, IInboxItemData, InboxItem } from './Inbox/InboxItem';
import { InboxSelectedItem } from './Inbox/InboxSelectedItem';
import TextField from '@material-ui/core/TextField';
import { BigNumber } from 'ethers';
import { makeStyles } from '@material-ui/styles';

export function CertificateInbox(): JSX.Element {
    const configuration = useOriginConfiguration();
    const { t } = useTranslation();

    const certificates: ICertificateViewItem[] = useSelector(getCertificates);
    const producingDevices = useSelector(getProducingDevices);
    const environment = useSelector(getEnvironment);

    const [allSelected, setAllSelected] = useState<boolean>(false);
    const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
    const [totalVolume, setTotalVolume] = useState(0);

    const [tabIndex, setTabIndex] = useState(0);
    const [price, setPrice] = useState(0);
    const [viewData, setViewData] = useState<IInboxItemData[]>([]);

    const updateView = () => {
        const newViewData = producingDevices
            .map((device) => {
                const deviceId = getDeviceId(device, environment);
                const certs = certificates.filter(
                    (c) => c.assetId !== undefined && c.deviceId === deviceId
                );

                return { certs, device };
            })
            .filter((d) => d.certs.length > 0)
            .map((item) => {
                return {
                    id: item.device.id.toString(),
                    name: item.device.facilityName,
                    country: item.device.country,
                    type: item.device.deviceType,
                    capacity: item.device.capacityInW,

                    certificates: item.certs.map((cert) => {
                        const en = cert.energy.publicVolume.toNumber() / 1000000;
                        return {
                            id: cert.id.toString(),
                            dateStart: cert.generationStartTime,
                            dateEnd: cert.generationEndTime,
                            energy: en,
                            maxEnergy: en,
                            source: cert.source,
                            assetId: cert.assetId
                        };
                    })
                };
            });

        setViewData(newViewData);
        setPrice(0);
    };

    useEffect(() => {
        console.log('certificates updated');
        updateView();
    }, [certificates]);

    function getSelectedCertificates(): IInboxCertificateData[] {
        const cs: Record<string, IInboxCertificateData> = {};
        viewData.forEach((d) => {
            d.certificates.forEach((c) => {
                cs[c.id] = c;
            });
        });

        const certs: IInboxCertificateData[] = [];

        selectedCerts.map((cId) => {
            if (cs[cId]) {
                certs.push(cs[cId]);
            }
        });

        return certs;
    }

    function updateTotalVolume() {
        let total = 0;

        getSelectedCertificates().forEach((c) => {
            total += c.energy;
        });

        setTotalVolume(total);
    }

    useEffect(() => {
        updateTotalVolume();
    }, [selectedCerts]);

    // toggle on/off selection on all certificates
    const selectAll = () => {
        if (allSelected) {
            setAllSelected(false);
            setSelectedDevices([]);
            setSelectedCerts([]);
        } else {
            setAllSelected(true);
            setSelectedDevices(producingDevices.map((d) => d.id.toString()));
            setSelectedCerts(certificates.map((c) => c.id.toString()));
        }
    };

    const areAllDeviceCertSelected = (
        device: IInboxItemData,
        selectedCertsList: string[]
    ): boolean => {
        let selectedCertCount = 0;
        device.certificates.forEach((c) => {
            if (selectedCertsList.includes(c.id)) {
                selectedCertCount++;
            }
        });
        return selectedCertCount === device.certificates.length;
    };

    const updateDeviceSelection = (deviceId: string, newState: string[]) => {
        const device = viewData.find((d) => d.id === deviceId);
        const currentState = areAllDeviceCertSelected(device, newState);

        if (currentState) {
            // select
            setSelectedDevices([...selectedDevices, deviceId]);
        } else {
            // deselect
            setSelectedDevices(selectedDevices.filter((d) => d !== deviceId));
        }
    };

    const checkCertficiate = (certId: string, deviceId: string) => {
        let newState: string[];

        if (selectedCerts.includes(certId)) {
            newState = selectedCerts.filter((id) => id !== certId);
            setAllSelected(false);
        } else {
            newState = [...selectedCerts, certId];
        }

        updateDeviceSelection(deviceId, newState);
        setSelectedCerts(newState);
    };

    const checkDevice = (deviceId: string) => {
        const device = viewData.find((d) => d.id === deviceId);
        const currentState = areAllDeviceCertSelected(device, selectedCerts);

        const newSelected: string[] = [...selectedCerts];

        // if currently all are selectedCerts
        if (currentState) {
            // uncheck all
            device.certificates.forEach((c) => {
                if (newSelected.includes(c.id)) {
                    newSelected.splice(newSelected.indexOf(c.id), 1);
                }
            });
            setSelectedCerts(newSelected);
            setSelectedDevices(selectedDevices.filter((d) => d !== deviceId));
            setAllSelected(false);
        } else {
            // check all
            device.certificates.forEach((c) => {
                if (!newSelected.includes(c.id)) {
                    newSelected.push(c.id);
                }
            });
            setSelectedCerts(newSelected);
            setSelectedDevices([...selectedDevices, deviceId]);
        }
    };

    const {
        MAIN_BACKGROUND_COLOR,
        TEXT_COLOR_DEFAULT,
        SIMPLE_TEXT_COLOR
    } = configuration?.styleConfig;

    const useStyles = makeStyles({
        box: {
            background: MAIN_BACKGROUND_COLOR,
            borderRadius: '2px',
            padding: '21px 24px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 2px 4px rgba(0,0,0,.2)'
        },
        header: {
            marginBottom: '18px',
            textTransform: 'uppercase'
        },
        pagination: {
            display: 'flex',
            justifyContent: 'flex-end'
        },
        selectAll: {
            padding: '0 0 2px 19px'
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

        selectedItemsEmpty: {
            padding: '64px 0',
            textAlign: 'center',
            fontSize: '14px',
            color: TEXT_COLOR_DEFAULT
        }
    });

    const classes = useStyles();

    const TabsHeader = (): JSX.Element => {
        return (
            <Tabs
                value={tabIndex}
                onChange={(ev, index) => setTabIndex(index)}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
            >
                <Tab label="Sell" />
                <Tab label="Withdraw" />
            </Tabs>
        );
    };

    const setEnergyForCertificate = (
        device: IInboxItemData,
        cert: IInboxCertificateData,
        value: number
    ) => {
        const newViewData = viewData.map((d) => {
            if (d.id === device.id) {
                d.certificates = d.certificates.map((c) => {
                    if (c.id === cert.id) {
                        return {
                            ...c,
                            energy: value
                        };
                    }
                    return c;
                });
            }
            return d;
        });

        setViewData(newViewData);
    };

    const SelectedCertificatesList = (): JSX.Element => {
        const selectedDeviceCertPairs: [IInboxItemData, IInboxCertificateData][] = [];

        viewData.forEach((d) => {
            d.certificates.forEach((c) => {
                if (selectedCerts.includes(c.id)) {
                    selectedDeviceCertPairs.push([d, c]);
                }
            });
        });

        return (
            <>
                {selectedDeviceCertPairs.map(([d, c]) => {
                    return (
                        <InboxSelectedItem
                            key={c.id}
                            cert={c}
                            device={d}
                            setEnergy={(v) => setEnergyForCertificate(d, c, v)}
                        />
                    );
                })}

                {selectedDeviceCertPairs.length === 0 && (
                    <div className={classes.selectedItemsEmpty}>
                        {t('certificate.info.selectCertificate')}
                    </div>
                )}
            </>
        );
    };

    const user = useSelector(getUserOffchain);
    const dispatch = useDispatch();

    async function publishForSale() {
        const certs = getSelectedCertificates();

        certs.forEach((certificate) => {
            dispatch(
                requestPublishForSale({
                    certificateId: parseInt(certificate.id, 10),
                    amount: BigNumber.from(certificate.energy * 1000000),
                    price: Math.round((price + Number.EPSILON) * 100),
                    callback: () => {
                        updateView();
                    },
                    source: certificate.source,
                    assetId: certificate.assetId
                })
            );
        });
    }

    async function withdraw() {
        const certs = getSelectedCertificates();
        const address = user.blockchainAccountAddress;

        certs.forEach((certificate) => {
            const assetId = certificate.assetId;
            const amount = (certificate.energy * 1000000).toString();
            dispatch(
                requestWithdrawCertificate({
                    assetId,
                    address,
                    amount,
                    callback: () => {
                        updateView();
                    }
                })
            );
        });
    }

    return (
        <div>
            <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                    <div className={classes.box}>
                        <Typography className={classes.header}>
                            {t('certificate.info.certificatesToImport')}
                        </Typography>
                        <div className={classes.selectAll}>
                            <Checkbox
                                color={'primary'}
                                value={allSelected}
                                onChange={() => selectAll()}
                            />
                            <span>{t('certificate.actions.selectAll')}</span>
                        </div>

                        {viewData.map((device) => (
                            <InboxItem
                                device={device}
                                key={device.id}
                                selected={selectedCerts}
                                selectedDevices={selectedDevices}
                                onDeviceSelect={checkDevice}
                                onCertificateSelect={checkCertficiate}
                            />
                        ))}
                    </div>
                </Grid>
                <Grid item xs={12} md={5}>
                    <TabsHeader />
                    <div className={classes.box}>
                        {tabIndex === 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography className={classes.header}>
                                    {t('certificate.info.selectedForSale')}
                                </Typography>
                                <SelectedCertificatesList />
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div className={classes.text_2}>Total volume: </div>
                                    <div className={classes.text_1} style={{ fontSize: 16 }}>
                                        {totalVolume}MWh
                                    </div>
                                </div>
                                <TextField
                                    style={{ margin: '24px 0' }}
                                    type={'number'}
                                    value={price}
                                    onChange={(ev) => {
                                        const newValue = parseFloat(ev.target.value);
                                        if (!isNaN(newValue)) setPrice(newValue);
                                    }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div className={classes.text_2}>Total price: </div>
                                    <div className={classes.text_1} style={{ fontSize: 16 }}>
                                        ${totalVolume * price}
                                    </div>
                                </div>

                                <Button
                                    color="primary"
                                    variant="contained"
                                    size="small"
                                    style={{ marginTop: '14px' }}
                                    disabled={selectedCerts.length === 0}
                                    onClick={() => publishForSale()}
                                >
                                    {t('certificate.actions.sellNCertificates', {
                                        count: selectedCerts.length
                                    })}
                                </Button>
                            </div>
                        )}
                        {tabIndex === 1 && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography className={classes.header}>
                                    {t('certificate.info.selectedForWithdraw')}
                                </Typography>
                                <SelectedCertificatesList />
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div className={classes.text_2}>Total volume: </div>
                                    <div className={classes.text_1} style={{ fontSize: 16 }}>
                                        {totalVolume}MWh
                                    </div>
                                </div>

                                <Button
                                    color="primary"
                                    variant="contained"
                                    size="small"
                                    style={{ marginTop: '14px' }}
                                    disabled={selectedCerts.length === 0}
                                    onClick={() => withdraw()}
                                >
                                    {t('certificate.actions.withdrawNCertificates', {
                                        count: selectedCerts.length
                                    })}
                                </Button>
                            </div>
                        )}
                    </div>
                </Grid>
            </Grid>
        </div>
    );
}
