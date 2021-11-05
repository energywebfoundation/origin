import { useState, SyntheticEvent } from 'react';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/styles';

export const useTableActionsEffects = () => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const mobileView = useMediaQuery(theme.breakpoints.down('lg'));

  const handleMobileOpen = (event: SyntheticEvent) => {
    if (mobileView) {
      event.stopPropagation();
      return setOpen(true);
    }
  };

  return { open, setOpen, mobileView, handleMobileOpen };
};
