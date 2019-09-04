// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Heiko Burkhardt, heiko.burkhardt@slock.it; Martin Kuechler, martin.kuchler@slock.it

import * as React from 'react';

import marker from '../../assets/marker.svg';
import map from '../../assets/map.svg';
import wind from '../../assets/icon_wind.svg';
import hydro from '../../assets/icon_hydro.svg';
import solar from '../../assets/icon_solar.svg';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { Certificate } from '@energyweb/origin';
import { User } from '@energyweb/user-registry';
import './DetailView.scss';
import { getOffChainText } from '../utils/Helper';
import { AssetType, Compliance, Configuration, IRECAssetService } from '@energyweb/utils-general';
import { ProducingAsset } from '@energyweb/asset-registry';
import { AssetMap } from './AssetMap';
import { SmartMeterReadingsTable } from './SmartMeterReadingsTable';
import { SmartMeterReadingsChart } from './SmartMeterReadingsChart';
import { CertificateTable, SelectedState } from './CertificateTable';
import { connect } from 'react-redux';
import { IStoreState } from '../types';
import { getProducingAssetDetailLink } from '../utils/routing';
import { getBaseURL, getCertificates, getConfiguration, getProducingAssets } from '../features/selectors';

interface IStateProps {
    baseURL: string;
    certificates: Certificate.Entity[];
    configuration: Configuration.Entity;
    producingAssets: ProducingAsset.Entity[];
}

interface IOwnProps {
    id: number;
    addSearchField: boolean;
    showSmartMeterReadings: boolean;
    showCertificates: boolean;
}

interface State {
    newId: number;
    owner: User.Entity;
    notSoldCertificates: number;
}

type Props = IOwnProps & IStateProps;

class ProducingAssetDetailViewClass extends React.Component<Props, State> {
    private IRECAssetService = new IRECAssetService();
    
    constructor(props: Props) {
        super(props);
        this.state = {
            newId: null,
            owner: null,
            notSoldCertificates: 0
        };
        this.onInputChange = this.onInputChange.bind(this);
    }

    onInputChange(e: any): void {
        this.setState({ newId: e.target.value });
    }

    async componentDidMount(): Promise<void> {
        await this.getOwner(this.props);
    }

    async componentWillReceiveProps(newProps: Props): Promise<void> {
        await this.getOwner(newProps);
    }

    async getOwner(props: Props): Promise<void> {
        if (props.id !== null && props.id !== undefined) {
            const selectedAsset = props.producingAssets.find(
                (p: ProducingAsset.Entity) => p.id === props.id.toString()
            );
            if (selectedAsset) {
                if (this.props.certificates.length > 0) {
                    this.setState({
                        notSoldCertificates: this.props.certificates
                            .map((certificate: Certificate.Entity) =>
                                certificate.owner === selectedAsset.owner.address &&
                                certificate.assetId.toString() === selectedAsset.id
                                    ? certificate.powerInW
                                    : 0
                            )
                            .reduce((a, b) => a + b)
                    });
                }
                this.setState({
                    owner: await new User.Entity(selectedAsset.owner.address, props.configuration as any).sync()
                });
            }
        }
    }

    render(): JSX.Element {
        const selectedAsset: ProducingAsset.Entity =
            this.props.id !== null && this.props.id !== undefined
                ? this.props.producingAssets.find(
                      (p: ProducingAsset.Entity) => p.id === this.props.id.toString()
                  )
                : null;

        let data;

        if (selectedAsset) {
            data = [
                [
                    {
                        label: 'Facility Name',
                        data: selectedAsset.offChainProperties.facilityName
                    },
                    {
                        label: 'Asset Owner',
                        data: this.state.owner ? this.state.owner.organization : ''
                    },
                    {
                        label:
                            'Certified by Registry' +
                            getOffChainText('complianceRegistry', selectedAsset.offChainProperties),
                        data:
                            Compliance[
                                selectedAsset.offChainProperties.complianceRegistry
                            ]
                    },
                    {
                        label:
                            'Other Green Attributes' +
                            getOffChainText(
                                'otherGreenAttributes',
                                selectedAsset.offChainProperties
                            ),
                        data: selectedAsset.offChainProperties.otherGreenAttributes
                    }
                ],
                [
                    {
                        label:
                            'Asset Type' +
                            getOffChainText('assetType', selectedAsset.offChainProperties),
                        data: this.IRECAssetService.decode(selectedAsset.offChainProperties.assetType)[0],
                        image:
                            AssetType.Wind === selectedAsset.offChainProperties.assetType
                                ? wind
                                : AssetType.Solar ===
                                  selectedAsset.offChainProperties.assetType
                                ? solar
                                : hydro,
                        rowspan: 2
                    },
                    {
                        label:
                            'Meter Read' +
                            getOffChainText(
                                'lastSmartMeterReadWh',
                                selectedAsset.offChainProperties
                            ),
                        data: (selectedAsset.lastSmartMeterReadWh / 1000).toLocaleString(),
                        tip: 'kWh'
                    },
                    {
                        label:
                            'Public Support' +
                            getOffChainText(
                                'typeOfPublicSupport',
                                selectedAsset.offChainProperties
                            ),
                        data: selectedAsset.offChainProperties.typeOfPublicSupport,
                        description: ''
                    },
                    {
                        label:
                            'Commissioning Date' +
                            getOffChainText('operationalSince', selectedAsset.offChainProperties),
                        data: moment(
                            selectedAsset.offChainProperties.operationalSince * 1000
                        ).format('MMM YY')
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
                            {data.map((row: any) => (
                                <tr key={row.key}>
                                    {row.map(col => {
                                        if (
                                            col.isAdditionalInformation &&
                                            !this.props.addSearchField
                                        ) {
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
                                                            <img src={col.image} />
                                                            {col.type === 'map' && (
                                                                <img
                                                                    src={marker as any}
                                                                    className="Marker"
                                                                />
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className={`Image Map`}>
                                                            <AssetMap assets={[selectedAsset]} />
                                                        </div>
                                                    ))}
                                                {col.description && (
                                                    <div className="Description">
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
                )}
            </div>
        );

        return (
            <div className="DetailViewWrapper">
                {this.props.addSearchField && (
                    <div className="FindAsset">
                        <input
                            onChange={this.onInputChange}
                            defaultValue={
                                this.props.id || this.props.id === 0 ? this.props.id.toString() : ''
                            }
                        />

                        <Link
                            className="btn btn-primary find-asset-button"
                            to={getProducingAssetDetailLink(this.props.baseURL, this.state.newId)}
                        >
                            Find Asset
                        </Link>
                    </div>
                )}

                {selectedAsset && (
                    <>
                        <div className="PageContentWrapper">
                            {pageBody}

                            {this.props.showSmartMeterReadings && (
                                <div className="PageBody p-4">
                                    <div className="PageBodyTitle">Smart meter readings</div>

                                    <div className="container-fluid">
                                        <div className="row">
                                            <div className="col-lg-4">
                                                <SmartMeterReadingsTable
                                                    conf={this.props.configuration}
                                                    producingAsset={selectedAsset}
                                                />
                                            </div>

                                            <div className="col-lg-8">
                                                <SmartMeterReadingsChart
                                                    conf={this.props.configuration}
                                                    producingAsset={selectedAsset}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {this.props.showCertificates && (
                            <>
                                <br />
                                <br />
                                <CertificateTable
                                    certificates={this.props.certificates.filter(
                                        (c: Certificate.Entity) =>
                                            c.assetId.toString() === this.props.id.toString()
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
}

export const ProducingAssetDetailView = connect((state: IStoreState): IStateProps => ({
    baseURL: getBaseURL(state),
    certificates: getCertificates(state),
    configuration: getConfiguration(state),
    producingAssets: getProducingAssets(state)
}))(ProducingAssetDetailViewClass);
