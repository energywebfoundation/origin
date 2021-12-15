import React, { FC } from 'react';
import {
  LoadScriptNext,
  GoogleMap,
  GoogleMapProps,
  Marker,
  InfoWindow,
  MarkerProps,
} from '@react-google-maps/api';
import { CircularProgress } from '@mui/material';
import { useGenericMapEffects } from './GenericMap.effects';
import { useStyles } from './GenericMap.styles';

export type MapItem = {
  id: string;
  latitude: string;
  longitude: string;
  label?: string;
  [key: string]: any;
};

export interface GenericMapProps {
  apiKey: string;
  mapItems: MapItem[];
  infoWindowContent?: FC<MapItem>;
  containerClassName?: string;
  mapProps?: GoogleMapProps;
  markerProps?: Omit<MarkerProps, 'position' | 'onClick' | 'label'>;
}

export const GenericMap: FC<GenericMapProps> = ({
  apiKey,
  mapItems,
  infoWindowContent: InfoWindowContent,
  containerClassName,
  mapProps,
  markerProps,
}) => {
  const {
    defaultCenter,
    updateBounds,
    showWindowForItem,
    itemHighlighted,
    setItemHighllighted,
  } = useGenericMapEffects(mapItems);
  const classes = useStyles();

  return (
    <LoadScriptNext
      googleMapsApiKey={apiKey}
      loadingElement={<CircularProgress />}
    >
      <GoogleMap
        zoom={10}
        center={defaultCenter}
        mapTypeId="hybrid"
        onLoad={(mapObject) => updateBounds(mapObject)}
        mapContainerClassName={containerClassName ?? classes.map}
        {...mapProps}
      >
        {mapItems.map((item) => (
          <React.Fragment key={item.id}>
            <Marker
              position={{
                lat: parseFloat(item.latitude),
                lng: parseFloat(item.longitude),
              }}
              onClick={() => showWindowForItem(item)}
              label={item.label}
              {...markerProps}
            />
          </React.Fragment>
        ))}

        {itemHighlighted && InfoWindowContent && (
          <InfoWindow
            position={{
              lat: parseFloat(itemHighlighted.latitude),
              lng: parseFloat(itemHighlighted.longitude),
            }}
            onCloseClick={() => setItemHighllighted(null)}
          >
            <InfoWindowContent {...itemHighlighted} />
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScriptNext>
  );
};
