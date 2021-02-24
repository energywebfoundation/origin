import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GoogleMap, InfoWindow, LoadScriptNext, Marker } from '@react-google-maps/api';
import { CircularProgress } from '@material-ui/core';
import { ProducingDevice } from '@energyweb/device-registry';
import { IPublicOrganization } from '@energyweb/origin-backend-core';
import { getBackendClient, getEnvironment } from '../../features/general';
import { getProducingDevices } from '../../features/devices';
import { useLinks } from '../../utils/routing';

interface IProps {
    devices?: ProducingDevice.Entity[];
    height?: string;
}

export function DeviceMap(props: IProps) {
    const environment = useSelector(getEnvironment);

    const [deviceHighlighted, setDeviceHighlighted] = useState<ProducingDevice.Entity>(null);
    const [organizations, setOrganizations] = useState<IPublicOrganization[]>();
    const [map, setMap] = useState(null);

    const producingDevices = useSelector(getProducingDevices);

    const { getProducingDeviceDetailLink } = useLinks();
    const backendClient = useSelector(getBackendClient);
    const { t } = useTranslation();

    const devices = props.devices || producingDevices;

    const { height = '250px' } = props;

    async function showWindowForDevice(device: ProducingDevice.Entity) {
        setDeviceHighlighted(device);
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
            const latitude = parseFloat(device.gpsLatitude);
            const longitude = parseFloat(device.gpsLongitude);

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

    useEffect(() => {
        (async () => {
            const { data: orgs } = await backendClient?.organizationClient?.getAll();
            setOrganizations(orgs.map((org) => ({ ...org, status: org.status })) ?? []);
        })();
    }, [backendClient.organizationClient]);

    const defaultCenter =
        devices.length > 0
            ? {
                  lat: parseFloat(devices[0].gpsLatitude),
                  lng: parseFloat(devices[0].gpsLongitude)
              }
            : {
                  lat: 0,
                  lng: 0
              };

    return (
        <LoadScriptNext
            googleMapsApiKey={environment.GOOGLE_MAPS_API_KEY}
            loadingElement={<CircularProgress />}
        >
            <GoogleMap
                center={defaultCenter}
                zoom={10}
                mapContainerStyle={{
                    height
                }}
                mapTypeId="hybrid"
                onLoad={(mapObject) => updateBounds(mapObject)}
            >
                {devices.map((device, index) => (
                    <React.Fragment key={index}>
                        <Marker
                            position={{
                                lat: parseFloat(device.gpsLatitude),
                                lng: parseFloat(device.gpsLongitude)
                            }}
                            onClick={() => showWindowForDevice(device)}
                        />
                    </React.Fragment>
                ))}

                {deviceHighlighted && (
                    <InfoWindow
                        position={{
                            lat: parseFloat(deviceHighlighted.gpsLatitude),
                            lng: parseFloat(deviceHighlighted.gpsLongitude)
                        }}
                        onCloseClick={() => {
                            setDeviceHighlighted(null);
                        }}
                    >
                        <div
                            style={{
                                color: 'black'
                            }}
                        >
                            <b>{deviceHighlighted.facilityName}</b>
                            <br />
                            <br />
                            {t('deviceMap.properties.owner')}:{' '}
                            {
                                organizations?.find(
                                    (o) => o?.id === deviceHighlighted.organizationId
                                )?.name
                            }
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
