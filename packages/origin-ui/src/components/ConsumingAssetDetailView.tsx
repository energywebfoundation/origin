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

import moment from 'moment';
import marker from '../../assets/marker.svg';
import map from '../../assets/map.svg';
import { Link } from 'react-router-dom';
import { Certificate } from '@energyweb/origin';
import { User } from '@energyweb/user-registry';
import { ConsumingAsset } from '@energyweb/asset-registry';

import './DetailView.scss';
import { getOffChainText } from '../utils/Helper';
import { Configuration } from '@energyweb/utils-general';
import { AssetMap } from './AssetMap';

export interface IDetailViewProps {
    conf: Configuration.Entity;
    id: number;
    baseUrl: string;
    certificates: Certificate.Entity[];
    consumingAssets: ConsumingAsset.Entity[];
}

export interface IDetailViewState {
    newId: number;
    owner: User;
    notSoldCertificates: number;
}

const TableWidth: number[] = [210, 210, 210, 210, 407];

export class ConsumingAssetDetailView extends React.Component<IDetailViewProps, IDetailViewState> {
    constructor(props: IDetailViewProps) {
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

    async componentWillReceiveProps(newProps: IDetailViewProps): Promise<void> {
        await this.getOwner(newProps);
    }

    async getOwner(props: IDetailViewProps): Promise<void> {
        if (typeof(props.id) === 'undefined') {
            return;
        }

        const selectedAsset: ConsumingAsset.Entity = props.consumingAssets.find(
            (c: ConsumingAsset.Entity) => c.id === props.id.toString()
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
                owner: await new User(selectedAsset.owner.address, props.conf as any).sync()
            });
        }
    }

    render(): JSX.Element {
        const selectedAsset: ConsumingAsset.Entity =
            this.props.id !== null && this.props.id !== undefined
                ? this.props.consumingAssets.find(
                      (p: ConsumingAsset.Entity) => p.id === this.props.id.toString()
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
                        label: 'Owner' + getOffChainText('owner', selectedAsset.offChainProperties),
                        data: this.state.owner ? this.state.owner.organization : ''
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
                    },

                    {
                        label: 'Kind',
                        data: 'Consumption'
                    }
                ],
                [
                    {
                        label:
                            'Commissioning Date' +
                            getOffChainText('operationalSince', selectedAsset.offChainProperties),
                        data: moment(
                            selectedAsset.offChainProperties.operationalSince * 1000
                        ).format('DD MMM YY')
                    },

                    {
                        label:
                            'Nameplate Capacity' +
                            getOffChainText('capacityWh', selectedAsset.offChainProperties),
                        data: selectedAsset.offChainProperties.capacityWh
                            ? (selectedAsset.offChainProperties.capacityWh / 1000).toFixed(3)
                            : '-',
                        tip: 'kW'
                    }
                ]
            ];
        }

        return (
            <div className="DetailViewWrapper">
                <div className="FindAsset">
                    <input
                        onChange={this.onInputChange}
                        defaultValue={
                            this.props.id || this.props.id === 0 ? this.props.id.toString() : ''
                        }
                    />

                    <Link
                        className="btn btn-primary find-asset-button"
                        to={`/${this.props.baseUrl}/assets/consuming_detail_view/${this.state.newId}`}
                    >
                        Find Asset
                    </Link>
                </div>
                <div className="PageContentWrapper">
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
                                            {row.map(col => (
                                                <td
                                                    key={col.key}
                                                    rowSpan={col.rowspan || 1}
                                                    colSpan={col.colspan || 1}
                                                >
                                                    <div className="Label">{col.label}</div>
                                                    <div className="Data">
                                                        {col.data}{' '}
                                                        {col.tip && <span>{col.tip}</span>}
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
                                                                <AssetMap
                                                                    assets={[selectedAsset]}
                                                                />
                                                            </div>
                                                        ))}
                                                    {col.description && (
                                                        <div className="Description">
                                                            {col.description}
                                                        </div>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

const addCommas = intNum => {
    return (intNum + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');
};
