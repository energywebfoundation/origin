import { ComposedDevice } from '@energyweb/origin-ui-device-data';
import { useState } from 'react';

export const useMyDeviceCardsListEffects = (devices: ComposedDevice[]) => {
  const [selected, setSelected] = useState(null);

  const handleSelect = (id) => {
    if (id === selected) {
      setSelected(null);
    } else {
      setSelected(id);
    }
  };

  const closeSidebar = () => setSelected(null);

  const selectedDevice = devices.find((device) => device.id === selected);

  return { selected, closeSidebar, handleSelect, selectedDevice };
};
