import React from 'react';
import { LoadScriptNext, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { APIKEY } from './GoogleApiKey';
import { Device } from '@energyweb/device-registry';
import { connect } from 'react-redux';
import { MarketUser } from '@energyweb/market';
import { IStoreState } from '../types';
import { Link } from 'react-router-dom';
import { getProducingDeviceDetailLink } from '../utils/routing';
import { getBaseURL, getProducingDevices, getConfiguration } from '../features/selectors';
import { CircularProgress } from '@material-ui/core';

interface IOwnProps {
    devices?: Device.Entity[];
    height?: string;
}

interface IStateProps {
    baseURL: string;
    configuration: IStoreState['configuration'];
}

type Props = IOwnProps & IStateProps;

interface IState {
    deviceHighlighted: Device.Entity;
    owner: MarketUser.Entity;
}

class DeviceMapClass extends React.Component<Props, IState> {
    map: any = null;

    constructor(props) {
        super(props);

        this.state = {
            deviceHighlighted: null,
            owner: null
        };
    }

    async showWindowForDevice(device: Device.Entity) {
        this.setState({
            deviceHighlighted: device,
            owner: await new MarketUser.Entity(
                device.owner.address,
                this.props.configuration as any
            ).sync()
        });
    }

    updateBounds(map: any = this.map) {
        const { devices } = this.props;

        if (this.map !== map) {
            this.map = map;
        }

        if (devices.length === 0 || !map) {
            return;
        }

        const bounds = {
            east: null,
            north: null,
            south: null,
            west: null
        };

        for (const device of devices) {
            const latitude = parseFloat(device.offChainProperties.gpsLatitude);
            const longitude = parseFloat(device.offChainProperties.gpsLongitude);

            bounds.north =
                latitude > bounds.north || bounds.north === null ? latitude : bounds.north;
            bounds.south =
                latitude < bounds.south || bounds.south === null ? latitude : bounds.south;

            bounds.east = longitude > bounds.east || bounds.east === null ? longitude : bounds.east;
            bounds.west = longitude < bounds.west || bounds.west === null ? longitude : bounds.west;
        }

        map.fitBounds(bounds, 80);
    }

    componentDidUpdate() {
        this.updateBounds();
    }

    render() {
        const { devices, height = '250px', baseURL } = this.props;
        const { deviceHighlighted, owner } = this.state;
        const defaultCenter =
            devices.length > 0
                ? {
                      lat: parseFloat(devices[0].offChainProperties.gpsLatitude),
                      lng: parseFloat(devices[0].offChainProperties.gpsLongitude)
                  }
                : {
                      lat: 0,
                      lng: 0
                  };

        return (
            <LoadScriptNext googleMapsApiKey={APIKEY} loadingElement={<CircularProgress />}>
                <GoogleMap
                    center={defaultCenter}
                    zoom={10}
                    mapContainerStyle={{
                        height
                    }}
                    mapTypeId="hybrid"
                    onLoad={map => this.updateBounds(map)}
                >
                    {devices.map((device, index) => (
                        <React.Fragment key={index}>
                            <Marker
                                position={{
                                    lat: parseFloat(device.offChainProperties.gpsLatitude),
                                    lng: parseFloat(device.offChainProperties.gpsLongitude)
                                }}
                                onClick={() => this.showWindowForDevice(device)}
                            />
                        </React.Fragment>
                    ))}

                    {deviceHighlighted && owner && (
                        <InfoWindow
                            position={{
                                lat: parseFloat(deviceHighlighted.offChainProperties.gpsLatitude),
                                lng: parseFloat(deviceHighlighted.offChainProperties.gpsLongitude)
                            }}
                            onCloseClick={() =>
                                this.setState({
                                    deviceHighlighted: null,
                                    owner: null
                                })
                            }
                        >
                            <div
                                style={{
                                    color: 'black'
                                }}
                            >
                                <b>{deviceHighlighted.offChainProperties.facilityName}</b>
                                <br />
                                <br />
                                Owner: {owner.organization}
                                <br />
                                <br />
                                <Link
                                    to={getProducingDeviceDetailLink(baseURL, deviceHighlighted.id)}
                                >
                                    See more
                                </Link>
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>
            </LoadScriptNext>
        );
    }
}

export const DeviceMap = connect((state: IStoreState, ownProps: IOwnProps) => ({
    devices: ownProps.devices || getProducingDevices(state),
    baseURL: getBaseURL(),
    configuration: getConfiguration(state)
}))(DeviceMapClass);
