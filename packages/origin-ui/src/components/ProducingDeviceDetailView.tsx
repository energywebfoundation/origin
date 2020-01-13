import React from 'react';
import marker from '../../assets/marker.svg';
import map from '../../assets/map.svg';
import wind from '../../assets/icon_wind.svg';
import hydro from '../../assets/icon_hydro.svg';
import iconThermal from '../../assets/icon_thermal.svg';
import iconSolid from '../../assets/icon_solid.svg';
import iconLiquid from '../../assets/icon_liquid.svg';
import iconGaseous from '../../assets/icon_gaseous.svg';
import iconMarine from '../../assets/icon_marine.svg';
import solar from '../../assets/icon_solar.svg';
import './DetailView.scss';
import { IRECDeviceService } from '@energyweb/utils-general';
import { ProducingDevice } from '@energyweb/device-registry';
import { DeviceMap } from './DeviceMap';
import { SmartMeterReadingsTable } from './SmartMeterReadingsTable';
import { SmartMeterReadingsChart } from './SmartMeterReadingsChart';
import { CertificateTable, SelectedState } from './CertificateTable';
import { useSelector, useDispatch } from 'react-redux';
import { getProducingDevices } from '../features/selectors';
import { getCertificates } from '../features/certificates/selectors';
import { requestUser } from '../features/users/actions';
import { getUserById, getUsers } from '../features/users/selectors';
import { MarketUser } from '@energyweb/market';
import { makeStyles, createStyles, useTheme } from '@material-ui/core';
import { PowerFormatter } from '../utils/PowerFormatter';
import { EnergyFormatter } from '../utils/EnergyFormatter';
import { formatDate } from '../utils/helper';

interface IProps {
    id: number;
    showSmartMeterReadings: boolean;
    showCertificates: boolean;
}

export function ProducingDeviceDetailView(props: IProps) {
    const certificates = useSelector(getCertificates);
    const producingDevices = useSelector(getProducingDevices);
    const users = useSelector(getUsers);

    const useStyles = makeStyles(() =>
        createStyles({
            attributionText: {
                fontSize: '10px',
                color: '#555555'
            }
        })
    );

    const classes = useStyles(useTheme());

    let owner: MarketUser.Entity = null;
    let selectedDevice: ProducingDevice.Entity = null;

    const deviceTypeService = new IRECDeviceService();

    if (props.id !== null && props.id !== undefined) {
        selectedDevice = producingDevices.find(p => p.id === props.id.toString());
    }

    if (selectedDevice) {
        owner = getUserById(users, selectedDevice.owner.address);

        if (!owner) {
            const dispatch = useDispatch();
            dispatch(requestUser(selectedDevice.owner.address));
        }
    }

    let data;
    let tooltip = '';

    if (selectedDevice) {
        const selectedDeviceType = selectedDevice.offChainProperties.deviceType;
        let image = solar;

        if (selectedDeviceType.startsWith('Wind')) {
            image = wind;
        } else if (selectedDeviceType.startsWith('Hydro-electric Head')) {
            image = hydro;
        } else if (selectedDeviceType.startsWith('Thermal')) {
            image = iconThermal;
            tooltip = 'Created by Adam Terpening from the Noun Project';
        } else if (selectedDeviceType.startsWith('Solid')) {
            image = iconSolid;
            tooltip = 'Created by ahmad from the Noun Project';
        } else if (selectedDeviceType.startsWith('Liquid')) {
            image = iconLiquid;
            tooltip = 'Created by BomSymbols from the Noun Project';
        } else if (selectedDeviceType.startsWith('Gaseous')) {
            image = iconGaseous;
            tooltip = 'Created by Deadtype from the Noun Project';
        } else if (selectedDeviceType.startsWith('Marine')) {
            image = iconMarine;
            tooltip = 'Created by Vectors Point from the Noun Project';
        }

        data = [
            [
                {
                    label: 'Facility name',
                    data: selectedDevice.offChainProperties.facilityName
                },
                {
                    label: 'Device owner',
                    data: owner ? owner.organization : ''
                },
                {
                    label: 'Certified by registry',
                    data: selectedDevice.offChainProperties.complianceRegistry
                },
                {
                    label: 'Other green attributes',
                    data: selectedDevice.offChainProperties.otherGreenAttributes
                }
            ],
            [
                {
                    label: 'Device type',
                    data: deviceTypeService.getDisplayText(
                        selectedDevice.offChainProperties.deviceType
                    ),
                    image,
                    rowspan: 2
                },
                {
                    label: 'Meter read',
                    data: EnergyFormatter.format(selectedDevice.lastSmartMeterReadWh),
                    tip: EnergyFormatter.displayUnit
                },
                {
                    label: 'Public support',
                    data: selectedDevice.offChainProperties.typeOfPublicSupport,
                    description: ''
                },
                {
                    label: 'Commissioning date',
                    data: formatDate(selectedDevice.offChainProperties.operationalSince * 1000)
                }
            ],
            [
                {
                    label: 'Nameplate capacity',
                    data: PowerFormatter.format(selectedDevice.offChainProperties.capacityInW),
                    tip: PowerFormatter.displayUnit
                },
                {
                    label: 'Geo location',
                    data:
                        selectedDevice.offChainProperties.gpsLatitude +
                        ', ' +
                        selectedDevice.offChainProperties.gpsLongitude,
                    image: map,
                    type: 'map',
                    rowspan: 3,
                    colspan: 2
                }
            ]
        ];
    }

    const pageBody = (
        <div className="PageBody">
            {!selectedDevice ? (
                <div className="text-center">
                    <strong>Device not found</strong>
                </div>
            ) : (
                <table>
                    <tbody>
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((col, colIndex) => {
                                    return (
                                        <td
                                            key={colIndex}
                                            rowSpan={col.rowspan || 1}
                                            colSpan={col.colspan || 1}
                                        >
                                            <div className="Label">{col.label}</div>
                                            <div className="Data">
                                                {col.data} {col.tip && <span>{col.tip}</span>}
                                            </div>
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
                                                            <div
                                                                className={classes.attributionText}
                                                            >
                                                                {tooltip}
                                                            </div>
                                                        )}
                                                        {col.type === 'map' && (
                                                            <img src={marker} className="Marker" />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className={`Image Map`}>
                                                        <DeviceMap devices={[selectedDevice]} />
                                                    </div>
                                                ))}
                                            {col.description && (
                                                <div className="Description">{col.description}</div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );

    return (
        <div className="DetailViewWrapper">
            {selectedDevice && (
                <>
                    <div className="PageContentWrapper">
                        {pageBody}

                        {props.showSmartMeterReadings && (
                            <div className="PageBody p-4">
                                <div className="PageBodyTitle">Smart meter readings</div>

                                <div className="container-fluid">
                                    <div className="row">
                                        <div className="col-lg-4">
                                            <SmartMeterReadingsTable
                                                producingDevice={selectedDevice}
                                            />
                                        </div>

                                        <div className="col-lg-8">
                                            <SmartMeterReadingsChart
                                                producingDevice={selectedDevice}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {props.showCertificates && (
                        <>
                            <br />
                            <br />
                            <CertificateTable
                                certificates={certificates.filter(
                                    c => c.certificate.deviceId.toString() === props.id.toString()
                                )}
                                selectedState={SelectedState.ForSale}
                                demand={null}
                                hiddenColumns={[
                                    'Device type',
                                    'Commissioning date',
                                    'Town, country'
                                ]}
                            />
                        </>
                    )}
                </>
            )}
        </div>
    );
}
