// eslint-disable-file no-unused-vars
import marker from '../../../assets/marker.svg';
import map from '../../../assets/map.svg';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles, createStyles, useTheme } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { IExternalDeviceId } from '@energyweb/origin-backend-core';
import {
    formatDate,
    EnergyFormatter,
    PowerFormatter,
    useTranslation,
    LightenColor,
    downloadFile,
    // SmartMeterReadingsTable,
    // SmartMeterReadingsChart,
    getBackendClient,
    moment,
    // SHOULD BE REMOVED
    getConfiguration,
    getCertificatesClient
} from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '../../types';
import { useOriginConfiguration } from '../../utils/configuration';
import { getAllDevices } from '../../features/devices';
import { DeviceMap } from '../map';
import { selectIconOnDeviceType } from '../../utils/deviceIcons';
// import { RegisterDeviceGroup } from '../../containers/RegisterDeviceGroup';

interface IProps {
    id?: string;
    externalId?: IExternalDeviceId;
    showSmartMeterReadings: boolean;
    showCertificates: boolean;
}

export function DeviceDetailView(props: IProps) {
    // should be removed
    const configuration = useSelector(getConfiguration);
    const allDevices = useSelector(getAllDevices);
    const backendClient = useSelector(getBackendClient);
    const certificatesClient = useSelector(getCertificatesClient);
    const organizationClient = backendClient?.organizationClient;

    const originContext = useOriginConfiguration();
    const originBgColor = originContext?.styleConfig?.MAIN_BACKGROUND_COLOR;
    const originTextColor = originContext?.styleConfig?.TEXT_COLOR_DEFAULT;
    const originSimpleTextColor = originContext?.styleConfig?.SIMPLE_TEXT_COLOR;

    const { t } = useTranslation();

    const bgColorDarken = LightenColor(originBgColor, -2);
    const attributionTextColor = LightenColor(originBgColor, 20);
    const textColorDarken = LightenColor(originTextColor, -4);
    const textColorLighten = LightenColor(originTextColor, 52);
    const bgColorLighten = LightenColor(originBgColor, 5);

    const useStyles = makeStyles(() =>
        createStyles({
            attributionText: {
                fontSize: '10px',
                color: attributionTextColor
            }
        })
    );

    const classes = useStyles(useTheme());

    const [selectedDevice, setSelectedDevice] = useState<ComposedPublicDevice>(null);
    useEffect(() => {
        if (props.id !== null && props.id !== undefined) {
            const device = allDevices.find((d) => d.id === props.id);
            setSelectedDevice(device);
        } else if (props.externalId) {
            const device = allDevices.find((p) =>
                p.externalDeviceIds?.find(
                    (deviceExternalId) =>
                        deviceExternalId.id === props.externalId.id &&
                        deviceExternalId.type === props.externalId.type
                )
            );
            setSelectedDevice(device);
        }
    }, [props.id, props.externalId]);

    const [tooltip, setTooltip] = useState<string>('');
    const [deviceTypeImage, setDeviceTypeImage] = useState();
    useEffect(() => {
        let isMounted = true;
        if (isMounted) {
            const [newTooltip, newImage] = selectIconOnDeviceType(selectedDevice, t);
            setTooltip(newTooltip);
            setDeviceTypeImage(newImage);
        }
        return () => {
            isMounted = false;
        };
    }, [selectedDevice]);

    const [meterReadCertified, setMeterReadCertified] = useState(null);
    useEffect(() => {
        const getMeterRead = async (id: string): Promise<void> => {
            if (id) {
                const start = new Date(new Date().getFullYear(), 0, 1).toISOString();
                const end = new Date(new Date().getFullYear(), 11, 31).toISOString();
                const {
                    data: meterReads
                } = await certificatesClient?.getAggregateCertifiedEnergyByDeviceId(id, start, end);
                setMeterReadCertified(meterReads);
            }
        };
        getMeterRead(selectedDevice?.externalRegistryId);
    }, [selectedDevice]);

    const data = [
        [
            {
                label: t('device.properties.facilityName'),
                data: selectedDevice?.name
            },
            {
                label: t('device.properties.deviceOwner'),
                data: selectedDevice?.registrantOrganization
            },
            {
                label: t('device.properties.complianceRegistry'),
                data: 'I-REC'
            }
        ],
        [
            {
                label: t('device.properties.deviceType'),
                data: selectedDevice?.deviceType,
                deviceTypeImage,
                rowspan: 2
            },
            {
                label: t('device.properties.meterReadCertified'),
                data: EnergyFormatter.format(meterReadCertified ?? 0),
                tip: EnergyFormatter.displayUnit
            },
            {
                label: t('device.properties.meterReadToBeCertified'),
                data: 'Read to be certified', // EnergyFormatter.format(selectedDevice.meterStats?.uncertified ?? 0),
                tip: EnergyFormatter.displayUnit
            },
            // {
            //     label: t('device.properties.publicSupport'),
            //     data: 'what is instead?', // selectedDevice.typeOfPublicSupport,
            //     description: ''
            // },
            {
                label: t('device.properties.vintageCod'),
                data: formatDate(moment(selectedDevice?.registrationDate).unix() * 1000)
            }
        ],
        [
            {
                label: t('device.properties.nameplateCapacity'),
                data: PowerFormatter.format(selectedDevice?.capacity),
                tip: PowerFormatter.displayUnit
            },
            {
                label: t('device.properties.geoLocation'),
                data: selectedDevice?.latitude + ', ' + selectedDevice?.longitude,
                image: map,
                type: 'map',
                rowspan: 3,
                colspan: 2
            }
        ],
        [
            {
                label: t('device.properties.filesUpload'),
                rowspan: 3,
                colspan: 2,
                ul: true,
                li: selectedDevice?.imageIds.map((fileId) => (
                    <li key={fileId}>
                        <a
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => downloadFile(backendClient?.fileClient, fileId, fileId)}
                        >
                            {fileId}
                        </a>
                    </li>
                ))
            }
        ]
    ];

    if (!configuration || !organizationClient || !selectedDevice) {
        return <Skeleton variant="rect" height={200} />;
    }

    const pageBody = (
        <div className="PageBody" style={{ backgroundColor: bgColorDarken }}>
            <table>
                <tbody>
                    {data.map((row: any, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((col, colIndex) => {
                                return (
                                    <td
                                        key={colIndex}
                                        rowSpan={col.rowspan || 1}
                                        colSpan={col.colspan || 1}
                                    >
                                        <div className="Label" style={{ color: textColorDarken }}>
                                            {col.label}
                                        </div>
                                        <div
                                            className="Data"
                                            style={{ color: originSimpleTextColor }}
                                        >
                                            {col.data}{' '}
                                            {col.tip && (
                                                <span style={{ color: originSimpleTextColor }}>
                                                    {col.tip}
                                                </span>
                                            )}
                                        </div>

                                        {col.ul && (
                                            <div
                                                className="Data"
                                                style={{ color: originSimpleTextColor }}
                                            >
                                                <ul>{col.li}</ul>
                                            </div>
                                        )}

                                        {col.image &&
                                            (col.type !== 'map' ? (
                                                <div className={`Image`}>
                                                    <img
                                                        src={col.image}
                                                        style={{
                                                            maxWidth: '200px',
                                                            maxHeight: '250px'
                                                        }}
                                                    />
                                                    {tooltip && (
                                                        <div className={classes.attributionText}>
                                                            {tooltip}
                                                        </div>
                                                    )}
                                                    {col.type === 'map' && (
                                                        <img src={marker} className="Marker" />
                                                    )}
                                                </div>
                                            ) : (
                                                <div
                                                    className={`Image Map`}
                                                    style={{
                                                        border: `5px solid ${bgColorLighten}`
                                                    }}
                                                >
                                                    <DeviceMap devices={[selectedDevice]} />
                                                </div>
                                            ))}
                                        {col.description && (
                                            <div
                                                className="Description"
                                                style={{ color: textColorLighten }}
                                            >
                                                {col.description}
                                            </div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="DetailViewWrapper">
            <div className="PageContentWrapper">{pageBody}</div>
            {props.showSmartMeterReadings && (
                <div className="PageBody p-4" style={{ backgroundColor: bgColorDarken }}>
                    <div className="PageBodyTitle" style={{ color: textColorDarken }}>
                        {t('meterReads.properties.smartMeterReadings')}
                    </div>

                    {/* Types issue of prop producingDevice */}
                    {/* <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-4">
                                <SmartMeterReadingsTable producingDevice={selectedDevice} />
                            </div>

                            <div className="col-lg-8">
                                <SmartMeterReadingsChart producingDevice={selectedDevice} />
                            </div>
                        </div>
                    </div> */}
                </div>
            )}
            {/* {selectedDevice?.deviceGroup && (
                <RegisterDeviceGroup device={selectedDevice} readOnly={true} />
            )} */}
        </div>
    );
}
