import React from 'react';

import moment from 'moment';
import marker from '../../assets/marker.svg';
import map from '../../assets/map.svg';
import { Link } from 'react-router-dom';
import { MarketUser, PurchasableCertificate } from '@energyweb/market';
import { ConsumingDevice } from '@energyweb/device-registry';
import './DetailView.scss';
import { getOffChainText } from '../utils/helper';
import { Configuration } from '@energyweb/utils-general';
import { DeviceMap } from './DeviceMap';
import { getConsumingDeviceDetailLink } from '../utils/routing';
import { connect } from 'react-redux';
import { IStoreState } from '../types';
import { getBaseURL, getConfiguration, getConsumingDevices } from '../features/selectors';
import { getCertificates } from '../features/certificates/selectors';

interface IOwnProps {
    id: number;
}

interface IStateProps {
    baseURL: string;
    certificates: PurchasableCertificate.Entity[];
    configuration: Configuration.Entity;
    consumingDevices: ConsumingDevice.Entity[];
}

type Props = IOwnProps & IStateProps;

export interface IDetailViewState {
    newId: number;
    owner: MarketUser.Entity;
    notSoldCertificates: number;
}

class ConsumingDeviceDetailViewClass extends React.Component<Props, IDetailViewState> {
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

        const selectedDevice: ConsumingDevice.Entity = props.consumingDevices.find(
            (c: ConsumingDevice.Entity) => c.id === props.id.toString()
        );
        if (selectedDevice) {
            if (this.props.certificates.length > 0) {
                this.setState({
                    notSoldCertificates: this.props.certificates
                        .map((certificate: PurchasableCertificate.Entity) =>
                            certificate.certificate.owner === selectedDevice.owner.address &&
                            certificate.certificate.deviceId.toString() === selectedDevice.id
                                ? certificate.certificate.energy
                                : 0
                        )
                        .reduce((a, b) => a + b)
                });
            }
            this.setState({
                owner: await new MarketUser.Entity(
                    selectedDevice.owner.address,
                    props.configuration as any
                ).sync()
            });
        }
    }

    render(): JSX.Element {
        const selectedDevice: ConsumingDevice.Entity =
            this.props.id !== null && this.props.id !== undefined
                ? this.props.consumingDevices.find(
                      (p: ConsumingDevice.Entity) => p.id === this.props.id.toString()
                  )
                : null;

        let data;
        if (selectedDevice) {
            data = [
                [
                    {
                        label: 'Facility Name',
                        data: selectedDevice.offChainProperties.facilityName
                    },
                    {
                        label:
                            'Owner' + getOffChainText('owner', selectedDevice.offChainProperties),
                        data: this.state.owner ? this.state.owner.organization : ''
                    },

                    {
                        label:
                            'Geo Location' +
                            getOffChainText('gpsLatitude', selectedDevice.offChainProperties),
                        data:
                            selectedDevice.offChainProperties.gpsLatitude +
                            ', ' +
                            selectedDevice.offChainProperties.gpsLongitude,
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
                            getOffChainText('operationalSince', selectedDevice.offChainProperties),
                        data: moment(
                            selectedDevice.offChainProperties.operationalSince * 1000
                        ).format('DD MMM YY')
                    },

                    {
                        label:
                            'Nameplate Capacity' +
                            getOffChainText('capacityWh', selectedDevice.offChainProperties),
                        data: selectedDevice.offChainProperties.capacityWh
                            ? (selectedDevice.offChainProperties.capacityWh / 1000).toFixed(3)
                            : '-',
                        tip: 'kW'
                    }
                ]
            ];
        }

        return (
            <div className="DetailViewWrapper">
                <div className="FindDevice">
                    <input
                        onChange={this.onInputChange}
                        defaultValue={
                            this.props.id || this.props.id === 0 ? this.props.id.toString() : ''
                        }
                    />

                    <Link
                        className="btn btn-primary find-device-button"
                        to={getConsumingDeviceDetailLink(this.props.baseURL, this.state.newId)}
                    >
                        Find Device
                    </Link>
                </div>
                <div className="PageContentWrapper">
                    <div className="PageBody">
                        {!selectedDevice ? (
                            <div className="text-center">
                                <strong>Device not found</strong>
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
                                                                <DeviceMap
                                                                    devices={[selectedDevice]}
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

export const ConsumingDeviceDetailView = connect(
    (state: IStoreState): IStateProps => ({
        baseURL: getBaseURL(),
        certificates: getCertificates(state),
        configuration: getConfiguration(state),
        consumingDevices: getConsumingDevices(state)
    })
)(ConsumingDeviceDetailViewClass);
