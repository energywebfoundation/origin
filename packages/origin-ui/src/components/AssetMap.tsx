import * as React from 'react';
import { LoadScriptNext, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { APIKEY } from './GoogleApiKey';
import { Asset } from '@energyweb/asset-registry';
import { connect } from 'react-redux';
import { User } from '@energyweb/user-registry';
import { IStoreState } from '../types';
import { Configuration } from '@energyweb/utils-general';
import { Link } from 'react-router-dom';
import { getProducingAssetDetailLink } from '../utils/routing';
import { getBaseURL, getProducingAssets, getConfiguration } from '../features/selectors';
import { CircularProgress } from '@material-ui/core';

interface IOwnProps {
    assets?: Asset.Entity[];
    height?: string;
}

interface IStateProps {
    baseURL: string;
    configuration: Configuration.Entity;
}

type Props = IOwnProps & IStateProps;

interface IState {
    assetHighlighted: Asset.Entity;
    owner: User.Entity;
}

class AssetMapClass extends React.Component<Props, IState> {
    map: any = null;

    constructor(props) {
        super(props);

        this.state = {
            assetHighlighted: null,
            owner: null
        };
    }

    async showWindowForAsset(asset: Asset.Entity) {
        this.setState({
            assetHighlighted: asset,
            owner: await new User.Entity(asset.owner.address, this.props
                .configuration as any).sync()
        });
    }

    updateBounds(map: any = this.map) {
        const { assets } = this.props;

        if (this.map !== map) {
            this.map = map;
        }

        if (assets.length === 0 || !map) {
            return;
        }

        const bounds = {
            east: null,
            north: null,
            south: null,
            west: null
        };

        for (const asset of assets) {
            const latitude = parseFloat(asset.offChainProperties.gpsLatitude);
            const longitude = parseFloat(asset.offChainProperties.gpsLongitude);

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
        const { assets, height = '250px', baseURL } = this.props;
        const { assetHighlighted, owner } = this.state;
        const defaultCenter =
            assets.length > 0
                ? {
                      lat: parseFloat(assets[0].offChainProperties.gpsLatitude),
                      lng: parseFloat(assets[0].offChainProperties.gpsLongitude)
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
                    {assets.map((asset, index) => (
                        <React.Fragment key={index}>
                            <Marker
                                position={{
                                    lat: parseFloat(asset.offChainProperties.gpsLatitude),
                                    lng: parseFloat(asset.offChainProperties.gpsLongitude)
                                }}
                                onClick={() => this.showWindowForAsset(asset)}
                            />
                        </React.Fragment>
                    ))}

                    {assetHighlighted && owner && (
                        <InfoWindow
                            position={{
                                lat: parseFloat(assetHighlighted.offChainProperties.gpsLatitude),
                                lng: parseFloat(assetHighlighted.offChainProperties.gpsLongitude)
                            }}
                            onCloseClick={() =>
                                this.setState({
                                    assetHighlighted: null,
                                    owner: null
                                })
                            }
                        >
                            <div
                                style={{
                                    color: 'black'
                                }}
                            >
                                <b>{assetHighlighted.offChainProperties.facilityName}</b>
                                <br />
                                <br />
                                Owner: {owner.organization}
                                <br />
                                <br />
                                <Link
                                    to={getProducingAssetDetailLink(baseURL, assetHighlighted.id)}
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

export const AssetMap = connect((state: IStoreState, ownProps: IOwnProps) => ({
    assets: ownProps.assets || getProducingAssets(state),
    baseURL: getBaseURL(state),
    configuration: getConfiguration(state)
}))(AssetMapClass);
