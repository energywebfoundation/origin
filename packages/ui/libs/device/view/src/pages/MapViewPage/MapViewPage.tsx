import { GenericMap } from '@energyweb/origin-ui-core';
import { CircularProgress } from '@material-ui/core';
import React, { FC } from 'react';
import { ItemHighlightedContent } from '../../containers';
import { useMapViewPageEffects } from './MapViewPage.effects';

export const MapViewPage: FC = () => {
  const { allDevices, isLoading } = useMapViewPageEffects();

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <GenericMap
      apiKey={process.env.NX_GOOGLE_MAPS_API_KEY}
      allItems={allDevices}
      infoWindowContent={ItemHighlightedContent}
    />
  );
};
