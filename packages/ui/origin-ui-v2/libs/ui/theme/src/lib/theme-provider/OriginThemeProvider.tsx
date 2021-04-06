import React, { FC } from 'react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import makeOriginUiConfig from '../utils/makeOriginUiConfig';

export const OriginThemeProvider: FC = ({ children }) => {
  const configuration = makeOriginUiConfig();
  return (
    <MuiThemeProvider theme={configuration.materialTheme}>
      {children}
    </MuiThemeProvider>
  );
};
