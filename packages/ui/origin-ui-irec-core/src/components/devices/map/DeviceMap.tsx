import React, { useState, useEffect, ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoadScriptNext, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { CircularProgress } from '@material-ui/core';
import { IPublicOrganization } from '@energyweb/origin-backend-core';
import { fromGeneralSelectors, useLinks } from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '../../../types';
import { getEnvironment } from '../../../features/general';

interface IProps {
    devices: ComposedPublicDevice[];
    height?: string;
}

export const DeviceMap = (props: IProps): ReactElement => {
    const { devices } = props;

    const [deviceHighlighted, setDeviceHighlighted] = useState<ComposedPublicDevice>(null);
    const [organizations, setOrganizations] = useState<IPublicOrganization[]>();
    const [map, setMap] = useState(null);

    const environment = useSelector(getEnvironment);
    const backendClient = useSelector(fromGeneralSelectors.getBackendClient);
    const { getDeviceDetailsPageUrl } = useLinks();
    const { t } = useTranslation();

    const { height = '250px' } = props;

    async function showWindowForDevice(device: ComposedPublicDevice) {
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
            const latitude = parseFloat(device.latitude);
            const longitude = parseFloat(device.longitude);

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
    }, [backendClient?.organizationClient]);

    const defaultCenter =
        devices.length > 0
            ? {
                  lat: parseFloat(devices[0].latitude),
                  lng: parseFloat(devices[0].longitude)
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
                                lat: parseFloat(device.latitude),
                                lng: parseFloat(device.longitude)
                            }}
                            onClick={() => showWindowForDevice(device)}
                        />
                    </React.Fragment>
                ))}

                {deviceHighlighted && (
                    <InfoWindow
                        position={{
                            lat: parseFloat(deviceHighlighted.latitude),
                            lng: parseFloat(deviceHighlighted.longitude)
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
                            <b>{deviceHighlighted.name}</b>
                            <br />
                            <br />
                            {t('deviceMap.properties.owner')}:{' '}
                            {
                                organizations?.find(
                                    (o) => o?.id === parseFloat(deviceHighlighted.ownerId)
                                )?.name
                            }
                            <br />
                            <br />
                            <Link to={getDeviceDetailsPageUrl(deviceHighlighted.id)}>
                                {t('deviceMap.actions.seeMore')}
                            </Link>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </LoadScriptNext>
    );
};
