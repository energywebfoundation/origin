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
import { EnergyFormatter, getDeviceId } from '../../utils';
import { IInboxCertificateData, IInboxItemData, InboxItem } from './Inbox/InboxItem';
import TextField from '@material-ui/core/TextField';
import { BigNumber } from 'ethers';
import { makeStyles } from '@material-ui/styles';
import { InboxItemPreview } from './Inbox/InboxItemPreview';
import { SelectedInboxList } from './Inbox/SelectedInboxList';

export function ExchangeInbox(): JSX.Element {
    const configuration = useOriginConfiguration();
    const { t } = useTranslation();

    const certificates: ICertificateViewItem[] = useSelector(getCertificates);
    const producingDevices = useSelector(getProducingDevices);
    const environment = useSelector(getEnvironment);

    const [allSelected, setAllSelected] = useState<boolean>(false);
    const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
    const [totalVolume, setTotalVolume] = useState(BigNumber.from(0));

    const [tabIndex, setTabIndex] = useState(0);
    const [price, setPrice] = useState(0);
    const [viewData, setViewData] = useState<IInboxItemData[]>([]);
    const [modalData, setModalData] = useState<IInboxCertificateData>(null);

    const user = useSelector(getUserOffchain);
    const dispatch = useDispatch();

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
                        const en = cert.energy.publicVolume;
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
        updateView();
    }, [certificates]);

    const getSelectedCertificates = (): IInboxCertificateData[] => {
        const allCerts: Record<string, IInboxCertificateData> = {};
        viewData.forEach((device) => {
            device.certificates.forEach((cert) => {
                allCerts[cert.id] = cert;
            });
        });

        const certs: IInboxCertificateData[] = [];

        selectedCerts.map((cId) => {
            if (allCerts[cId]) {
                certs.push(allCerts[cId]);
            }
        });

        return certs;
    };

    const updateTotalVolume = () => {
        let total = BigNumber.from(0);

        getSelectedCertificates().forEach((c) => {
            total = total.add(c.energy);
        });

        setTotalVolume(total);
    };

    useEffect(() => {
        updateTotalVolume();
    }, [selectedCerts]);

    const onSelectAllChecked = () => {
        if (allSelected) {
            setAllSelected(false);
            setSelectedDevices([]);
            setSelectedCerts([]);
        } else {
            setAllSelected(true);
            setSelectedDevices(producingDevices.map((d) => d.id.toString()));
            setSelectedCerts(
                certificates.filter((c) => c.assetId !== undefined).map((c) => c.id.toString())
            );
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
        const allDevicesCertSelected = areAllDeviceCertSelected(device, newState);

        if (allDevicesCertSelected) {
            const newDevicesState = [...selectedDevices, deviceId];
            setSelectedDevices(newDevicesState);
            if (newDevicesState.length >= viewData.length) {
                setAllSelected(true);
            }
        } else {
            setSelectedDevices(selectedDevices.filter((d) => d !== deviceId));
            setAllSelected(false);
        }
    };

    const checkCertificate = (certId: string, deviceId: string) => {
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

        const newSelected: string[] = [...selectedCerts];

        if (selectedDevices.includes(deviceId)) {
            device.certificates.forEach((c) => {
                if (newSelected.includes(c.id)) {
                    newSelected.splice(newSelected.indexOf(c.id), 1);
                }
            });
            setSelectedCerts(newSelected);
            setSelectedDevices(selectedDevices.filter((d) => d !== deviceId));
            setAllSelected(false);
        } else {
            device.certificates.forEach((c) => {
                if (!newSelected.includes(c.id)) {
                    newSelected.push(c.id);
                }
            });
            setSelectedCerts(newSelected);
            const newDevicesState = [...selectedDevices, deviceId];
            setSelectedDevices(newDevicesState);
            if (newDevicesState.length >= viewData.length) {
                setAllSelected(true);
            }
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

    const setEnergyForCertificate = (
        device: IInboxItemData,
        cert: IInboxCertificateData,
        value: BigNumber
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
        updateTotalVolume();
    };

    async function publishForSale() {
        const certs = getSelectedCertificates();

        certs.forEach((certificate) => {
            dispatch(
                requestPublishForSale({
                    certificateId: parseInt(certificate.id, 10),
                    amount: certificate.energy,
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
            const amount = certificate.energy.toString();
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

    const SelectedCertificatesList = (): [IInboxItemData, IInboxCertificateData][] => {
        const selectedDeviceCertPairs: [IInboxItemData, IInboxCertificateData][] = [];

        viewData.forEach((d) => {
            d.certificates.forEach((c) => {
                if (selectedCerts.includes(c.id)) {
                    selectedDeviceCertPairs.push([d, c]);
                }
            });
        });

        return selectedDeviceCertPairs;
    };

    return (
        <div>
            <InboxItemPreview
                open={modalData !== null}
                setOpen={() => setModalData(null)}
                data={modalData}
            />
            <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                    <div className={classes.box}>
                        <Typography className={classes.header}>
                            {t('certificate.info.exchangeInbox')}
                        </Typography>
                        <div className={classes.selectAll}>
                            <Checkbox
                                color={'primary'}
                                checked={allSelected}
                                onChange={() => onSelectAllChecked()}
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
                                onCertificateSelect={checkCertificate}
                                onViewClick={(id) =>
                                    setModalData(device.certificates.find((c) => c.id === id))
                                }
                            />
                        ))}
                    </div>
                </Grid>
                <Grid item xs={12} md={5}>
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
                    <div className={classes.box}>
                        {tabIndex === 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography className={classes.header}>
                                    {t('certificate.info.selectedForSale')}
                                </Typography>
                                <SelectedInboxList
                                    pairs={SelectedCertificatesList()}
                                    setEnergy={setEnergyForCertificate}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div className={classes.text_2}>
                                        {t('certificate.info.totalVolume')}:{' '}
                                    </div>
                                    <div className={classes.text_1} style={{ fontSize: 16 }}>
                                        ${EnergyFormatter.format(totalVolume, true)}
                                    </div>
                                </div>
                                <TextField
                                    style={{ margin: '24px 0' }}
                                    type="number"
                                    value={price}
                                    onChange={(ev) => {
                                        const newValue = parseFloat(ev.target.value);
                                        if (!isNaN(newValue)) setPrice(newValue);
                                    }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div className={classes.text_2}>
                                        {t('certificate.info.totalPrice')}:{' '}
                                    </div>
                                    <div className={classes.text_1} style={{ fontSize: 16 }}>
                                        ${EnergyFormatter.format(totalVolume.mul(price))}
                                    </div>
                                </div>

                                <Button
                                    color="primary"
                                    variant="contained"
                                    size="small"
                                    style={{ marginTop: '14px' }}
                                    disabled={
                                        selectedCerts.length === 0 || selectedCerts.length > 1
                                    }
                                    onClick={() => publishForSale()}
                                >
                                    {t('certificate.actions.sellNCertificates', {
                                        count: selectedCerts.length
                                    })}
                                    {selectedCerts.length > 1 && ' *'}
                                </Button>
                            </div>
                        )}
                        {tabIndex === 1 && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography className={classes.header}>
                                    {t('certificate.info.selectedForWithdraw')}
                                </Typography>
                                <SelectedInboxList
                                    pairs={SelectedCertificatesList()}
                                    setEnergy={setEnergyForCertificate}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div className={classes.text_2}>Total volume: </div>
                                    <div className={classes.text_1} style={{ fontSize: 16 }}>
                                        ${EnergyFormatter.format(totalVolume.mul(price))}
                                    </div>
                                </div>

                                <Button
                                    color="primary"
                                    variant="contained"
                                    size="small"
                                    style={{ marginTop: '14px' }}
                                    disabled={
                                        selectedCerts.length === 0 || selectedCerts.length > 1
                                    }
                                    onClick={() => withdraw()}
                                >
                                    {t('certificate.actions.withdrawNCertificates', {
                                        count: selectedCerts.length
                                    })}
                                    {selectedCerts.length > 1 && ' *'}
                                </Button>
                            </div>
                        )}
                        {selectedCerts.length > 1 && (
                            <div>
                                * Bulk certificate actions are currently unavailable. Select single
                                certificate to continue
                            </div>
                        )}
                    </div>
                </Grid>
            </Grid>
        </div>
    );
}
