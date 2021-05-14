import { GenericMap } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import { ItemHighlightedContent } from '../../containers';
import { allDevicesMock } from '../../__mocks__/allDeviceMock';

export const MapViewPage: FC = () => {
  return (
    <GenericMap
      apiKey=""
      allItems={allDevicesMock}
      infoWindowContent={ItemHighlightedContent}
    />
  );
};
