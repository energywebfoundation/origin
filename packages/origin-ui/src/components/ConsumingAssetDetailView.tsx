import React from 'react';

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
import { getConsumingAssetDetailLink } from '../utils/routing';
import { connect } from 'react-redux';
import { IStoreState } from '../types';
import { getBaseURL, getConfiguration, getConsumingAssets } from '../features/selectors';
import { getCertificates } from '../features/certificates/selectors';

interface IOwnProps {
    id: number;
}

interface IStateProps {
    baseURL: string;
    certificates: Certificate.Entity[];
    configuration: Configuration.Entity;
    consumingAssets: ConsumingAsset.Entity[];
}

type Props = IOwnProps & IStateProps;

export interface IDetailViewState {
    newId: number;
    owner: User.Entity;
    notSoldCertificates: number;
}

class ConsumingAssetDetailViewClass extends React.Component<Props, IDetailViewState> {
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

    async UNSAFE_componentWillReceiveProps(newProps: Props): Promise<void> {
        await this.getOwner(newProps);
    }

    async getOwner(props: Props): Promise<void> {
        if (typeof props.id === 'undefined') {
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
                                ? certificate.energy
                                : 0
                        )
                        .reduce((a, b) => a + b)
                });
            }
            this.setState({
                owner: await new User.Entity(
                    selectedAsset.owner.address,
                    props.configuration as any
                ).sync()
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
                        to={getConsumingAssetDetailLink(this.props.baseURL, this.state.newId)}
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

export const ConsumingAssetDetailView = connect(
    (state: IStoreState): IStateProps => ({
        baseURL: getBaseURL(),
        certificates: getCertificates(state),
        configuration: getConfiguration(state),
        consumingAssets: getConsumingAssets(state)
    })
)(ConsumingAssetDetailViewClass);
