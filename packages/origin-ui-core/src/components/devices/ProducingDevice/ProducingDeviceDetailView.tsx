import { ProducingDevice } from '@energyweb/device-registry';
import { IExternalDeviceId } from '@energyweb/origin-backend-core';
import { createStyles, makeStyles, useTheme } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import iconGaseous from '../../../../assets/icon_gaseous.svg';
import hydro from '../../../../assets/icon_hydro.svg';
import iconLiquid from '../../../../assets/icon_liquid.svg';
import iconMarine from '../../../../assets/icon_marine.svg';
import solar from '../../../../assets/icon_solar.svg';
import iconSolid from '../../../../assets/icon_solid.svg';
import iconThermal from '../../../../assets/icon_thermal.svg';
import wind from '../../../../assets/icon_wind.svg';
import map from '../../../../assets/map.svg';
import marker from '../../../../assets/marker.svg';
import { getBackendClient } from '../../../features/general/selectors';
import { getConfiguration, getProducingDevices } from '../../../features/selectors';
import {
    EnergyFormatter,
    formatDate,
    LightenColor,
    PowerFormatter,
    useTranslation
} from '../../../utils';
import { useOriginConfiguration } from '../../../utils/configuration';
import { downloadFile } from '../../Organization/DownloadDocuments';
import { DeviceGroupForm } from '../DeviceGroupForm';
import { DeviceMap } from '../DeviceMap';
import { SmartMeterReadingsChart } from '../SmartMeterReadings/SmartMeterReadingsChart';
import { SmartMeterReadingsTable } from '../SmartMeterReadings/SmartMeterReadingsTable';

interface IProps {
    id?: number;
    externalId?: IExternalDeviceId;
    showSmartMeterReadings: boolean;
    showCertificates: boolean;
}

export function ProducingDeviceDetailView(props: IProps) {
    const configuration = useSelector(getConfiguration);
    const producingDevices = useSelector(getProducingDevices);
    const backendClient = useSelector(getBackendClient);
    const organizationClient = useSelector(getBackendClient)?.organizationClient;

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

    let selectedDevice: ProducingDevice.Entity = null;
    const [organizationName, setOrganizationName] = useState('');

    if (props.id !== null && props.id !== undefined) {
        selectedDevice = producingDevices.find((p) => p.id === props.id);
    } else if (props.externalId) {
        selectedDevice = producingDevices.find((p) =>
            p.externalDeviceIds?.find(
                (deviceExternalId) =>
                    deviceExternalId.id === props.externalId.id &&
                    deviceExternalId.type === props.externalId.type
            )
        );
    }

    const fetchOrganizationName = async (orgId: number) => {
        if (orgId) {
            const {
                data: { name }
            } = await organizationClient.getPublic(orgId);
            setOrganizationName(name);
        }
    };
    fetchOrganizationName(selectedDevice?.organizationId);

    if (!configuration || !organizationClient || !selectedDevice) {
        return <Skeleton variant="rect" height={200} />;
    }

    let tooltip = '';

    const selectedDeviceType = selectedDevice.deviceType;
    let image = solar;

    if (selectedDeviceType.startsWith('Wind')) {
        image = wind;
    } else if (selectedDeviceType.startsWith('Hydro-electric Head')) {
        image = hydro;
    } else if (selectedDeviceType.startsWith('Thermal')) {
        image = iconThermal;
        tooltip = t('general.feedback.createdByNoun', { fullName: 'Adam Terpening' });
    } else if (selectedDeviceType.startsWith('Solid')) {
        image = iconSolid;
        tooltip = t('general.feedback.createdByNoun', { fullName: 'ahmad' });
    } else if (selectedDeviceType.startsWith('Liquid')) {
        image = iconLiquid;
        tooltip = t('general.feedback.createdByNoun', { fullName: 'BomSymbols' });
    } else if (selectedDeviceType.startsWith('Gaseous')) {
        image = iconGaseous;
        tooltip = t('general.feedback.createdByNoun', { fullName: 'Deadtype' });
    } else if (selectedDeviceType.startsWith('Marine')) {
        image = iconMarine;
        tooltip = t('general.feedback.createdByNoun', { fullName: 'Vectors Point' });
    }

    const data = [
        [
            {
                label: t('device.properties.facilityName'),
                data: selectedDevice.facilityName
            },
            {
                label: t('device.properties.deviceOwner'),
                data: organizationName ?? ''
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
                image,
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
                            onClick={() => downloadFile(backendClient?.fileClient, fileId, fileId)}
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

                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-4">
                                <SmartMeterReadingsTable producingDevice={selectedDevice} />
                            </div>

                            <div className="col-lg-8">
                                <SmartMeterReadingsChart producingDevice={selectedDevice} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {selectedDevice?.deviceGroup && (
                <DeviceGroupForm device={selectedDevice} readOnly={true} />
            )}
            {/* {props.showCertificates && (
                <>
                    <br />
                    <br />
                    <CertificateTable
                        certificates={certificates.filter(
                            c => c.deviceId.toString() === props.id.toString()
                        )}
                        selectedState={SelectedState.ForSale}
                        hiddenColumns={['deviceType', 'commissioningDate', 'locationText']}
                    />
                </>
            )} */}
        </div>
    );
}
