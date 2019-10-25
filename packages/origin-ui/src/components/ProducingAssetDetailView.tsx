import React, { useState } from 'react';

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
import moment from 'moment';
import { Link } from 'react-router-dom';
import './DetailView.scss';
import { getOffChainText } from '../utils/Helper';
import { Compliance, IRECAssetService } from '@energyweb/utils-general';
import { ProducingAsset } from '@energyweb/asset-registry';
import { AssetMap } from './AssetMap';
import { SmartMeterReadingsTable } from './SmartMeterReadingsTable';
import { SmartMeterReadingsChart } from './SmartMeterReadingsChart';
import { CertificateTable, SelectedState } from './CertificateTable';
import { useSelector, useDispatch } from 'react-redux';
import { getProducingAssetDetailLink } from '../utils/routing';
import { getBaseURL, getConfiguration, getProducingAssets } from '../features/selectors';
import { getCertificates } from '../features/certificates/selectors';
import { requestUser } from '../features/users/actions';
import { getUserById, getUsers } from '../features/users/selectors';
import { User } from '@energyweb/user-registry';
import { makeStyles, createStyles, useTheme } from '@material-ui/core';

interface IProps {
    id: number;
    addSearchField: boolean;
    showSmartMeterReadings: boolean;
    showCertificates: boolean;
}

export function ProducingAssetDetailView(props: IProps) {
    const baseURL = useSelector(getBaseURL);
    const certificates = useSelector(getCertificates);
    const configuration = useSelector(getConfiguration);
    const producingAssets = useSelector(getProducingAssets);
    const users = useSelector(getUsers);

    const [newId, setNewId] = useState(null);

    const useStyles = makeStyles(() =>
        createStyles({
            attributionText: {
                fontSize: '10px',
                color: '#555555'
            }
        })
    );

    const classes = useStyles(useTheme());

    let owner: User.Entity = null;
    let selectedAsset: ProducingAsset.Entity = null;

    const assetTypeService = new IRECAssetService();

    if (props.id !== null && props.id !== undefined) {
        selectedAsset = producingAssets.find(p => p.id === props.id.toString());
    }

    if (selectedAsset && certificates.length > 0) {
        owner = getUserById(users, selectedAsset.owner.address);

        if (!owner) {
            const dispatch = useDispatch();
            dispatch(requestUser(selectedAsset.owner.address));
        }
    }

    let data;
    let tooltip = '';

    if (selectedAsset) {
        const selectedAssetType = selectedAsset.offChainProperties.assetType;
        let image = solar;

        if (selectedAssetType.startsWith('Wind')) {
            image = wind;
        } else if (selectedAssetType.startsWith('Hydro-electric Head')) {
            image = hydro;
        } else if (selectedAssetType.startsWith('Thermal')) {
            image = iconThermal;
            tooltip = 'Created by Adam Terpening from the Noun Project';
        } else if (selectedAssetType.startsWith('Solid')) {
            image = iconSolid;
            tooltip = 'Created by ahmad from the Noun Project';
        } else if (selectedAssetType.startsWith('Liquid')) {
            image = iconLiquid;
            tooltip = 'Created by BomSymbols from the Noun Project';
        } else if (selectedAssetType.startsWith('Gaseous')) {
            image = iconGaseous;
            tooltip = 'Created by Deadtype from the Noun Project';
        } else if (selectedAssetType.startsWith('Marine')) {
            image = iconMarine;
            tooltip = 'Created by Vectors Point from the Noun Project';
        }

        data = [
            [
                {
                    label: 'Facility Name',
                    data: selectedAsset.offChainProperties.facilityName
                },
                {
                    label: 'Asset Owner',
                    data: owner ? owner.organization : ''
                },
                {
                    label:
                        'Certified by Registry' +
                        getOffChainText('complianceRegistry', selectedAsset.offChainProperties),
                    data: Compliance[selectedAsset.offChainProperties.complianceRegistry]
                },
                {
                    label:
                        'Other Green Attributes' +
                        getOffChainText('otherGreenAttributes', selectedAsset.offChainProperties),
                    data: selectedAsset.offChainProperties.otherGreenAttributes
                }
            ],
            [
                {
                    label: 'Asset Type',
                    data: assetTypeService.getDisplayText(
                        selectedAsset.offChainProperties.assetType
                    ),
                    image,
                    rowspan: 2
                },
                {
                    label:
                        'Meter Read' +
                        getOffChainText('lastSmartMeterReadWh', selectedAsset.offChainProperties),
                    data: (selectedAsset.lastSmartMeterReadWh / 1000).toLocaleString(),
                    tip: 'kWh'
                },
                {
                    label:
                        'Public Support' +
                        getOffChainText('typeOfPublicSupport', selectedAsset.offChainProperties),
                    data: selectedAsset.offChainProperties.typeOfPublicSupport,
                    description: ''
                },
                {
                    label:
                        'Commissioning Date' +
                        getOffChainText('operationalSince', selectedAsset.offChainProperties),
                    data: moment(selectedAsset.offChainProperties.operationalSince * 1000).format(
                        'MMM YY'
                    )
                }
            ],
            [
                {
                    label:
                        'Nameplate Capacity' +
                        getOffChainText('capacityWh', selectedAsset.offChainProperties),
                    data: (selectedAsset.offChainProperties.capacityWh / 1000).toLocaleString(),
                    tip: 'kW'
                },
                {
                    label:
                        'Geo Location' +
                        getOffChainText('gpsLatitude', selectedAsset.offChainProperties),
                    data:
                        selectedAsset.offChainProperties.gpsLatitude +
                        ', ' +
                        selectedAsset.offChainProperties.gpsLongitude,
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
            {!selectedAsset ? (
                <div className="text-center">
                    <strong>Asset not found</strong>
                </div>
            ) : (
                <table>
                    <tbody>
                        {data.map(row => (
                            <tr key={row.key}>
                                {row.map(col => {
                                    if (col.isAdditionalInformation && !props.addSearchField) {
                                        return null;
                                    }

                                    return (
                                        <td
                                            key={col.key}
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
                                                        <AssetMap assets={[selectedAsset]} />
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
            {props.addSearchField && (
                <div className="FindAsset">
                    <input
                        onChange={e => setNewId(e.target.value)}
                        defaultValue={props.id || props.id === 0 ? props.id.toString() : ''}
                    />

                    <Link
                        className="btn btn-primary find-asset-button"
                        to={getProducingAssetDetailLink(baseURL, newId)}
                    >
                        Find Asset
                    </Link>
                </div>
            )}

            {selectedAsset && (
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
                                                conf={configuration}
                                                producingAsset={selectedAsset}
                                            />
                                        </div>

                                        <div className="col-lg-8">
                                            <SmartMeterReadingsChart
                                                conf={configuration}
                                                producingAsset={selectedAsset}
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
                                    c => c.assetId.toString() === props.id.toString()
                                )}
                                selectedState={SelectedState.ForSale}
                                demand={null}
                                hiddenColumns={[
                                    'Asset Type',
                                    'Commissioning Date',
                                    'Town, Country'
                                ]}
                            />
                        </>
                    )}
                </>
            )}
        </div>
    );
}
