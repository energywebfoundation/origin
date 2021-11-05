import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { useConnectMetamaskPlaceHolderEffects } from './ConnectMetamaskPlaceholder.effects';

export const ConnectMetamaskPlaceholder = () => {
  const { mobileView, title, clickHandler, buttonText } =
    useConnectMetamaskPlaceHolderEffects();

  return (
    <Box>
      <Box mb={2}>
        <Typography variant="h5" component="span">
          {title}
        </Typography>
      </Box>
      <Box>
        <Button
          fullWidth={false}
          color="primary"
          variant="contained"
          onClick={clickHandler}
          disabled={mobileView}
        >
          {buttonText}
        </Button>
      </Box>
    </Box>
  );
};
