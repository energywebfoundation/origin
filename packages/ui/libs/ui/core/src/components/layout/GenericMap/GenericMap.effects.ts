import { useState } from 'react';

export const useGenericMapEffects = (items: any[]) => {
  const [map, setMap] = useState(null);
  const [itemHighlighted, setItemHighllighted] = useState(null);

  const updateBounds = (targetMap: any = map) => {
    if (targetMap && map !== targetMap) {
      setMap(targetMap);
    }
    if (items.length === 0 || !targetMap) {
      return;
    }

    const bounds = {
      east: null,
      north: null,
      south: null,
      west: null,
    };

    for (const item of items) {
      const latitude = parseFloat(item.latitude);
      const longitude = parseFloat(item.longitude);

      bounds.north =
        latitude > bounds.north || bounds.north === null
          ? latitude
          : bounds.north;
      bounds.south =
        latitude < bounds.south || bounds.south === null
          ? latitude
          : bounds.south;
      bounds.east =
        longitude > bounds.east || bounds.east === null
          ? longitude
          : bounds.east;
      bounds.west =
        longitude < bounds.west || bounds.west === null
          ? longitude
          : bounds.west;
    }
    targetMap.fitBounds(bounds, 80);
  };

  const showWindowForItem = async (item: any) => setItemHighllighted(item);

  const defaultCenter =
    items.length > 0
      ? {
          lat: parseFloat(items[0].latitude),
          lng: parseFloat(items[0].longitude),
        }
      : {
          lat: 0,
          lng: 0,
        };

  return {
    defaultCenter,
    updateBounds,
    showWindowForItem,
    itemHighlighted,
    setItemHighllighted,
  };
};
