import { GenericMap } from '@energyweb/origin-ui-core';
import { CircularProgress } from '@mui/material';
import React, { FC } from 'react';
import { ItemHighlightedContent } from '../../containers';
import { useMapViewPageEffects } from './MapViewPage.effects';

export const MapViewPage: FC = () => {
  const { allDevices, isLoading, googleMapsApiKey } = useMapViewPageEffects();

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <GenericMap
      apiKey={googleMapsApiKey}
      mapItems={allDevices}
      infoWindowContent={ItemHighlightedContent}
    />
  );
};

export default MapViewPage;
