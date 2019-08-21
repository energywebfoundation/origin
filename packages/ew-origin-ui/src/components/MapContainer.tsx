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
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
import { APIKEY } from './GoogleApiKey';
import './DetailView.scss';
import * as EwAsset from 'ew-asset-registry-lib';
export interface MapDetailProps {
    asset: EwAsset.Asset.Entity;
}

const MyMapComponent = withScriptjs(
    withGoogleMap((props: any) => (
        <GoogleMap
            defaultZoom={18}
            defaultCenter={{
                lat: parseFloat(props.asset.offChainProperties.gpsLatitude),
                lng: parseFloat(props.asset.offChainProperties.gpsLongitude)
            }}
            defaultMapTypeId={'satellite'}
        >
            <Marker
                position={{
                    lat: parseFloat(props.asset.offChainProperties.gpsLatitude),
                    lng: parseFloat(props.asset.offChainProperties.gpsLongitude)
                }}
            />
        </GoogleMap>
    ))
);

export class MapContainer extends React.Component<MapDetailProps, {}> {
    constructor(props) {
        super(props);
        this.state = {
            producingAsset: null
        };
    }

    render() {
        const mapURL =
            'https://maps.googleapis.com/maps/api/js?key=' +
            APIKEY +
            '&v=3.exp&libraries=geometry,drawing,places';

        return (
            <div>
                <MyMapComponent
                    asset={this.props.asset}
                    googleMapURL={mapURL}
                    loadingElement={<div style={{ height: `100%` }} />}
                    containerElement={<div style={{ height: `250px` }} />}
                    mapElement={<div style={{ height: `100%` }} />}
                />
            </div>
        );
    }
}
