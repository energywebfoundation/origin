import { useState } from 'react';
import { useTheme, useMediaQuery } from '@material-ui/core';

export const useTableActionsEffects = () => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const mobileView = useMediaQuery(theme.breakpoints.down('lg'));

  const handleMobileOpen = (event) => {
    if (mobileView) {
      event.stopPropagation();
      return setOpen(true);
    }
  };

  return { open, setOpen, mobileView, handleMobileOpen };
};
