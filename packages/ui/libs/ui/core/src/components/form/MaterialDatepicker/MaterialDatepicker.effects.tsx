import { useState } from 'react';
import { MaterialDatepickerProps } from './MaterialDatepicker';

export const useMaterialDatepickerEffects = ({
  onChange,
}: Pick<MaterialDatepickerProps, 'onChange'>) => {
  const [open, setOpen] = useState(false);
  const adornmentPosition: 'start' | 'end' = 'start';

  const handlePickerOpen = () => setOpen(true);
  const handlePickerClose = () => setOpen(false);
  const clearValue = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();

    onChange(null);
  };

  return {
    open,
    clearValue,
    handlePickerOpen,
    handlePickerClose,
    adornmentPosition,
  };
};
