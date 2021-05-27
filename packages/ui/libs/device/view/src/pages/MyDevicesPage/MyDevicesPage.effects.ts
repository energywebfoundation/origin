import { useMyDevices } from '@energyweb/origin-ui-device-data';
import { useState } from 'react';

export const useMyDevicePageEffects = () => {
  const [selected, setSelected] = useState(null);
  const myDevices = useMyDevices();

  const handleSelect = (id) => {
    if (id === selected) {
      setSelected(null);
    } else {
      setSelected(id);
    }
  };

  console.log(myDevices);

  return { selected, handleSelect };
};
