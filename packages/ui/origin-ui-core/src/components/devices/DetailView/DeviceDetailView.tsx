import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@material-ui/lab';
import { DeviceClient } from '@energyweb/origin-device-registry-irec-form-api-client';
import { OrganizationClient } from '@energyweb/origin-backend-client';
import { IExternalDeviceId } from '@energyweb/origin-backend-core';

import { getConfiguration } from '../../../features/configuration';
import { EnergyFormatter } from '../../../utils/EnergyFormatter';
import { formatDate } from '../../../utils/time';
import { LightenColor } from '../../../utils/colors';
import { PowerFormatter } from '../../../utils/PowerFormatter';
import { useOriginConfiguration } from '../../../utils/configuration';
import { SmartMeterReadingsChart } from '../SmartMeterReadings/SmartMeterReadingsChart';
import { SmartMeterReadingsTable } from '../SmartMeterReadings/SmartMeterReadingsTable';
import { downloadFileHandler } from '../../Documents';
import { DeviceGroupForm } from '../DeviceGroupForm';
import { DeviceMap } from '../DeviceMap';

import { showNotification, NotificationTypeEnum } from '../../../utils/notifications';
import { IOriginDevice } from '../../../types';
import { getDeviceLocationText } from '../../../utils/device';
import { DeviceIcon } from '../../Icons';
import map from '../../../../assets/map.svg';
import marker from '../../../../assets/marker.svg';
import { makeStyles } from '@material-ui/core';
import { fromGeneralSelectors } from '../../../features';

interface IProps {
    id: number;
    showSmartMeterReadings: boolean;
    showCertificates: boolean;
    externalId?: IExternalDeviceId;
}

const useStyles = makeStyles({
    icon: {
        width: 100,
        height: 100,
        marginTop: 20,
        marginBottom: 20
    }
});

export function DeviceDetailView(props: IProps) {
    const configuration = useSelector(getConfiguration);
    const backendClient = useSelector(fromGeneralSelectors.getBackendClient);
    const deviceClient: DeviceClient = backendClient?.deviceClient;
    const organizationClient: OrganizationClient = backendClient?.organizationClient;

    const originContext = useOriginConfiguration();
    const originBgColor = originContext?.styleConfig?.MAIN_BACKGROUND_COLOR;
    const originTextColor = originContext?.styleConfig?.TEXT_COLOR_DEFAULT;
    const originSimpleTextColor = originContext?.styleConfig?.SIMPLE_TEXT_COLOR;

    const { t } = useTranslation();
    const classes = useStyles();

    const bgColorDarken = LightenColor(originBgColor, -2);
    const textColorDarken = LightenColor(originTextColor, -4);
    const textColorLighten = LightenColor(originTextColor, 52);
    const bgColorLighten = LightenColor(originBgColor, 5);
    const unselectedIconColor = LightenColor(originTextColor, -7);

    const [selectedDevice, setSelectedDevice] = useState<IOriginDevice>(null);

    const fetchDevice = async (deviceId: number) => {
        try {
            const { data: device } = await deviceClient.get(
                deviceId.toString(),
                props.showSmartMeterReadings
            );

            if (device) {
                const {
                    data: { name: orgName }
                } = await organizationClient.getPublic(device.organizationId);

                setSelectedDevice({
                    ...device,
                    organizationName: orgName,
                    locationText: getDeviceLocationText(device)
                });
            }
        } catch (error) {
            showNotification(t('device.feedback.errorGettingDevices'), NotificationTypeEnum.Error);
            console.log(error);
        }
    };

    useEffect(() => {
        if (props.id) {
            fetchDevice(props.id);
        }
    }, [props.id]);

    if (!configuration || !organizationClient || !selectedDevice) {
        return <Skeleton variant="rect" height={200} />;
    }

    const data = [
        [
            {
                label: t('device.properties.facilityName'),
                data: selectedDevice.facilityName
            },
            {
                label: t('device.properties.deviceOwner'),
                data: selectedDevice.organizationName ?? ''
            },
            {
                label: t('device.properties.complianceRegistry'),
                data: selectedDevice.complianceRegistry
            },
            {
                label: t('device.properties.otherGreenAttributes'),
                data: selectedDevice.otherGreenAttributes
            }
        ],
        [
            {
                label: t('device.properties.deviceType'),
                data: configuration.deviceTypeService?.getDisplayText(selectedDevice.deviceType),
                image: (
                    <div style={{ fill: unselectedIconColor }}>
                        <DeviceIcon className={classes.icon} type={selectedDevice.deviceType} />
                    </div>
                ),
                rowspan: 2
            },
            {
                label: t('device.properties.meterReadCertified'),
                data: EnergyFormatter.format(selectedDevice.meterStats?.certified ?? 0),
                tip: EnergyFormatter.displayUnit
            },
            {
                label: t('device.properties.meterReadToBeCertified'),
                data: EnergyFormatter.format(selectedDevice.meterStats?.uncertified ?? 0),
                tip: EnergyFormatter.displayUnit
            },
            {
                label: t('device.properties.publicSupport'),
                data: selectedDevice.typeOfPublicSupport,
                description: ''
            },
            {
                label: t('device.properties.vintageCod'),
                data: formatDate(selectedDevice.operationalSince * 1000)
            }
        ],
        [
            {
                label: t('device.properties.nameplateCapacity'),
                data: PowerFormatter.format(selectedDevice.capacityInW),
                tip: PowerFormatter.displayUnit
            },
            {
                label: t('device.properties.geoLocation'),
                data: selectedDevice.gpsLatitude + ', ' + selectedDevice.gpsLongitude,
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
                li: JSON.parse(selectedDevice.files).map((fileId) => (
                    <li key={fileId}>
                        <a
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() =>
                                downloadFileHandler(backendClient?.fileClient, fileId, fileId)
                            }
                        >
                            {fileId}
                        </a>
                    </li>
                ))
            }
        ]
    ];

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
                                                <>
                                                    {col.image}
                                                    {col.type === 'map' && (
                                                        <img src={marker} className="Marker" />
                                                    )}
                                                </>
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

                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-4">
                                <SmartMeterReadingsTable device={selectedDevice} />
                            </div>

                            <div className="col-lg-8">
                                <SmartMeterReadingsChart device={selectedDevice} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {selectedDevice.deviceGroup && (
                <DeviceGroupForm device={selectedDevice} readOnly={true} />
            )}
        </div>
    );
}
