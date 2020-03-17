import React, { useState, useEffect } from 'react';
import { LoadScriptNext, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { APIKEY } from './GoogleApiKey';
import { ProducingDevice } from '@energyweb/device-registry';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useLinks } from '../utils/routing';
import { getProducingDevices } from '../features/selectors';
import { CircularProgress } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

interface IProps {
    devices?: ProducingDevice.Entity[];
    height?: string;
}

export function DeviceMap(props: IProps) {
    const [deviceHighlighted, setDeviceHighlighted] = useState<ProducingDevice.Entity>(null);
    const [owner, setOwner] = useState<string>(null);
    const [map, setMap] = useState(null);

    const producingDevices = useSelector(getProducingDevices);

    const { getProducingDeviceDetailLink } = useLinks();
    const { t } = useTranslation();

    const devices = props.devices || producingDevices;

    const { height = '250px' } = props;

    async function showWindowForDevice(device: ProducingDevice.Entity) {
        setDeviceHighlighted(device);
        setOwner(device.owner.address);
    }

    function updateBounds(targetMap: any = map) {
        if (targetMap && map !== targetMap) {
            setMap(targetMap);
        }

        if (devices.length === 0 || !targetMap) {
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

        targetMap.fitBounds(bounds, 80);
    }

    useEffect(() => {
        updateBounds();
    }, [devices, map]);

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
                onLoad={mapObject => updateBounds(mapObject)}
            >
                {devices.map((device, index) => (
                    <React.Fragment key={index}>
                        <Marker
                            position={{
                                lat: parseFloat(device.offChainProperties.gpsLatitude),
                                lng: parseFloat(device.offChainProperties.gpsLongitude)
                            }}
                            onClick={() => showWindowForDevice(device)}
                        />
                    </React.Fragment>
                ))}

                {deviceHighlighted && owner && (
                    <InfoWindow
                        position={{
                            lat: parseFloat(deviceHighlighted.offChainProperties.gpsLatitude),
                            lng: parseFloat(deviceHighlighted.offChainProperties.gpsLongitude)
                        }}
                        onCloseClick={() => {
                            setDeviceHighlighted(null);
                            setOwner(null);
                        }}
                    >
                        <div
                            style={{
                                color: 'black'
                            }}
                        >
                            <b>{deviceHighlighted.offChainProperties.facilityName}</b>
                            <br />
                            <br />
                            {t('deviceMap.properties.owner')}: {owner}
                            <br />
                            <br />
                            <Link to={getProducingDeviceDetailLink(deviceHighlighted.id)}>
                                {t('deviceMap.actions.seeMore')}
                            </Link>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </LoadScriptNext>
    );
}
