import React, { createContext, useEffect, useState } from 'react';
import { useOriginConfiguration } from '../../utils/configuration';
import { Checkbox, Grid, Tab, Tabs, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import {
    CertificateSource,
    getCertificates,
    ICertificateViewItem
} from '../../features/certificates';
import {
    getMyDevices,
    fetchMyDevices,
    fromGeneralSelectors,
    fromUsersSelectors
} from '../../features';
import { getDeviceId } from '../../utils';
import { IInboxCertificateData, IInboxItemData, InboxItem } from './Inbox';
import { BigNumber } from 'ethers';
import { makeStyles } from '@material-ui/styles';
import { useHistory } from 'react-router-dom';
import { TableFallback } from '../Table';
import { useLinks } from '../../hooks';

export const InboxItemEditContext = createContext<{
    isEditing: boolean;
    setIsEditing: (state: boolean) => void;
}>(null);

interface IProps {
    mode: CertificateSource;
    title: string;
    tabs: string[];
    children: (props: {
        totalVolume: BigNumber;
        getSelectedCertificates: () => IInboxCertificateData[];
        updateView: () => void;
        selectedCerts: number[];
        getSelectedItems: () => [IInboxItemData, IInboxCertificateData][];
        setEnergy: (device: IInboxItemData, cert: IInboxCertificateData, value: BigNumber) => void;
        tabIndex: number;
    }) => JSX.Element;
}

export function InboxPanel(props: IProps): JSX.Element {
    const { mode, title, tabs } = props;
    const configuration = useOriginConfiguration();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const deviceClient = useSelector(fromGeneralSelectors.getBackendClient)?.deviceClient;
    const { getCertificateDetailsPageUrl } = useLinks();

    useEffect(() => {
        if (deviceClient) {
            dispatch(fetchMyDevices());
        }
    }, [deviceClient]);

    const allCertificates: ICertificateViewItem[] = useSelector(getCertificates);
    const [certificates, setCertificates] = useState<ICertificateViewItem[]>([]);
    const myDevices = useSelector(getMyDevices);
    const environment = useSelector(fromGeneralSelectors.getEnvironment);

    const [allSelected, setAllSelected] = useState<boolean>(false);
    const [selectedCerts, setSelectedCerts] = useState<number[]>([]);
    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

    const [tabIndex, setTabIndex] = useState(0);
    const [viewData, setViewData] = useState<IInboxItemData[]>([]);

    const [isEditing, setIsEditing] = useState(false);

    const user = useSelector(fromUsersSelectors.getUserOffchain);

    useEffect(() => {
        setCertificates(
            allCertificates
                .filter((c) => c.source === mode)
                .filter((c) => c.energy.publicVolume.toNumber() !== 0)
        );
    }, [allCertificates]);

    const updateView = () => {
        const newViewData =
            myDevices !== null
                ? myDevices
                      .map((device) => {
                          const deviceId = getDeviceId(device, environment);
                          const certs = certificates.filter((c) => c.deviceId === deviceId);

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
                                      id: cert.id,
                                      dateStart: cert.generationStartTime,
                                      dateEnd: cert.generationEndTime,
                                      energy: en,
                                      maxEnergy: en,
                                      source: cert.source,
                                      assetId: cert.assetId
                                  };
                              })
                          };
                      })
                : [];

        setViewData(newViewData);
        setAllSelected(false);
        setSelectedCerts([]);
        setSelectedDevices([]);
    };

    useEffect(() => {
        updateView();
    }, [certificates, myDevices, user]);

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

    const [totalVolume, setTotalVolume] = useState(BigNumber.from(0));

    const updateTotalVolume = () => {
        let total = BigNumber.from(0);

        getSelectedCertificates().forEach((c) => {
            total = total.add(c.energy);
        });

        setTotalVolume(total);
    };

    useEffect(() => {
        updateTotalVolume();
        setIsEditing(false);
    }, [selectedCerts, viewData]);

    const onSelectAllChecked = () => {
        if (allSelected) {
            setAllSelected(false);
            setSelectedDevices([]);
            setSelectedCerts([]);
        } else {
            setAllSelected(true);
            setSelectedDevices(myDevices.map((d) => d.id.toString()));
            setSelectedCerts(certificates.filter((c) => c.assetId !== undefined).map((c) => c.id));
        }
    };

    const areAllDeviceCertSelected = (
        device: IInboxItemData,
        selectedCertsList: number[]
    ): boolean => {
        let selectedCertCount = 0;
        device.certificates.forEach((c) => {
            if (selectedCertsList.includes(c.id)) {
                selectedCertCount++;
            }
        });
        return selectedCertCount === device.certificates.length;
    };

    const updateDeviceSelection = (deviceId: string, newState: number[]) => {
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

    const checkCertificate = (certId: number, deviceId: string) => {
        let newState: number[];

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

        const newSelected: number[] = [...selectedCerts];

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

    const { TEXT_COLOR_DEFAULT, MAIN_BACKGROUND_COLOR } = configuration?.styleConfig;

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

        selectedItemsEmpty: {
            padding: '64px 0',
            textAlign: 'center',
            fontSize: '14px',
            color: TEXT_COLOR_DEFAULT
        }
    });

    const classes = useStyles();

    const setEnergy = (device: IInboxItemData, cert: IInboxCertificateData, value: BigNumber) => {
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

    const history = useHistory();
    function viewDetails(certificateId: number) {
        history.push(getCertificateDetailsPageUrl(certificateId));
    }

    const getSelectedItems = (): [IInboxItemData, IInboxCertificateData][] => {
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

    if (allCertificates === null || myDevices === null) {
        return <TableFallback />;
    }

    return (
        <div>
            <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                    <div className={classes.box}>
                        <Typography className={classes.header}>{t(title)}</Typography>
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
                                onViewClick={(id) => viewDetails(id)}
                            />
                        ))}
                    </div>
                </Grid>
                <Grid item xs={12} md={5}>
                    <Tabs
                        value={tabIndex}
                        onChange={(ev, index) => {
                            setIsEditing(false);
                            setTabIndex(index);
                        }}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        {tabs.map((tab) => (
                            <Tab key={tab} label={tab} />
                        ))}
                    </Tabs>
                    <InboxItemEditContext.Provider value={{ isEditing, setIsEditing }}>
                        <div className={classes.box}>
                            {props.children({
                                tabIndex,
                                selectedCerts,
                                getSelectedItems,
                                setEnergy,
                                getSelectedCertificates,
                                updateView,
                                totalVolume
                            })}
                            {selectedCerts.length > 1 && (
                                <div>
                                    * Bulk certificate actions are currently unavailable. Select
                                    single certificate to continue
                                </div>
                            )}
                        </div>
                    </InboxItemEditContext.Provider>
                </Grid>
            </Grid>
        </div>
    );
}
