import React, { FC } from 'react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import StyledEngineProvider from '@material-ui/core/StyledEngineProvider';
import makeOriginUiConfig from '../utils/makeOriginUiConfig';

export const OriginThemeProvider: FC = ({ children }) => {
  const configuration = makeOriginUiConfig();
  return (
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={configuration.materialTheme}>
        {children}
      </MuiThemeProvider>
    </StyledEngineProvider>
  );
};
